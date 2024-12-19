import json
import csv
from flask import Flask, request, jsonify, send_file
from neo4j import GraphDatabase
from io import BytesIO, TextIOWrapper
from flask_cors import CORS
from io import StringIO

uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"
driver = GraphDatabase.driver(uri, auth=(username, password))

app = Flask(__name__)
CORS(app, support_credentials=True)

def filter_toponyms(filters):
    LIMIT = 5  
    page = filters.get("page", 0)   
    skip = page * LIMIT  

    type_param = filters.get("type")
    if type_param and not isinstance(type_param, list):
        type_param = [type_param]

    style_param = filters.get("style")
    if style_param and not isinstance(style_param, list):
        style_param = [style_param]

    query = """
    MATCH (t:Toponym)
    OPTIONAL MATCH (t)-[:STYLED]->(s:Style)
    OPTIONAL MATCH (t)-[:BUILT]->(a:Architect)
    OPTIONAL MATCH (t)-[:HAVE_TYPE]->(tp:Type)
    OPTIONAL MATCH (t)-[:HAS_PHOTO]->(p:Photo)
    OPTIONAL MATCH (t)-[:RENAMED]->(nr:NameRecord)
    WITH t, s, a, tp, p, nr
    ORDER BY nr.EffectiveDateFrom DESC
    WITH t,
         COLLECT(DISTINCT s.Name) AS styles,
         COLLECT(DISTINCT a.Name) AS architects,
         COLLECT(DISTINCT tp.Name) AS types,
         HEAD(COLLECT(DISTINCT p.PhotoUrl)) AS photoUrl,
         [year IN COLLECT(DISTINCT
            CASE
                WHEN nr.EffectiveDateFrom IS NOT NULL AND nr.EffectiveDateFrom <> '' THEN
                    toInteger(substring(toString(nr.EffectiveDateFrom), 0, 4))
                ELSE NULL
            END
        ) WHERE year IS NOT NULL] AS renameYears,
         HEAD(COLLECT(nr.Name)) AS latestName,
         CASE WHEN p IS NOT NULL THEN true ELSE false END AS hasPhotoFlag
    WHERE ($style IS NULL OR ANY(style_param IN $style WHERE style_param IN styles))
      AND ($type IS NULL OR ANY(type_param IN $type WHERE type_param IN types))
      AND ($architect IS NULL OR ANY(architect IN architects WHERE architect CONTAINS $architect))
      AND ($hasPhoto IS NULL OR hasPhotoFlag = $hasPhoto)
      AND ($renamedDateFrom IS NULL OR ANY(year IN renameYears WHERE year >= $renamedDateFrom))
      AND ($renamedDateTo IS NULL OR ANY(year IN renameYears WHERE year <= $renamedDateTo))
      AND ($cardSearch IS NULL OR (
            t.Address CONTAINS $cardSearch OR
            t.BriefDescription CONTAINS $cardSearch
          ))
      AND ($constructionDateFrom IS NULL OR t.ConstructionDateFrom >= $constructionDateFrom)
      AND ($constructionDateTo IS NULL OR t.ConstructionDateTo <= $constructionDateTo)
    RETURN COALESCE(latestName, t.BriefDescription) AS name,
           renameYears,
           t.Address AS address,
           photoUrl,
           types,
           styles,
           architects
    """
    parameters = {
        "type": type_param,
        "style": style_param,
        "hasPhoto": filters.get("hasPhoto"),
        "architect": filters.get("architect"),
        "renamedDateFrom": int(filters.get("renamedDateFrom")) if filters.get("renamedDateFrom") else None,
        "renamedDateTo": int(filters.get("renamedDateTo")) if filters.get("renamedDateTo") else None,
        "cardSearch": filters.get("cardSearch"),
        "constructionDateFrom": filters.get("constructionDateFrom"),
        "constructionDateTo": filters.get("constructionDateTo"),
        "skip": skip,
        "limit": LIMIT
    }

    with driver.session() as session:
        result = session.run(query, **parameters)
        toponyms = []
        for record in result:
            toponyms.append({
                "name": record["name"],
                "renameYears": record["renameYears"],
                "address": record["address"],
                "photoUrl": record["photoUrl"] if record["photoUrl"] else None,
                "type": record["types"],
                "style": record["styles"],
                "architect": record["architects"]
            })
        return toponyms

@app.route('/api/toponyms', methods=['POST'])
def get_toponyms():
    filters = request.json  
    toponyms = filter_toponyms(filters)
    return jsonify(toponyms)

@app.route('/api/import', methods=['POST'])
def import_data():
    file = request.files['file']
    if not file:
        return jsonify({"error": "No file provided"}), 400

    data = json.load(file)
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

        for toponym in data["toponyms"]:
            session.run(
                """
                MERGE (t:Toponym {
                    _id: $_id,
                    Address: $address,
                    ConstructionDateTo: $constructionDateTo,
                    ConstructionDateFrom: $constructionDateFrom,
                    BriefDescription: $briefDescription,
                    Point: point({latitude: $latitude, longitude: $longitude, crs: $crs})
                })
                """,
                _id=toponym["_id"],
                address=toponym["Address"],
                constructionDateFrom=toponym["ConstructionDateFrom"],
                constructionDateTo=toponym["ConstructionDateTo"],
                briefDescription=toponym["BriefDescription"],
                latitude=toponym["Point"]["latitude"],
                longitude=toponym["Point"]["longitude"],
                crs=toponym["Point"]["crs"]
            )

            for style in toponym["style"]:
                session.run(
                    """
                    MATCH (t:Toponym {_id: $_id})
                    MERGE (s:Style {Name: $styleName})
                    MERGE (t)-[:STYLED]->(s)
                    """,
                    _id=toponym["_id"],
                    styleName=style
                )

            for type in toponym["types"]:
                session.run(
                    """
                    MATCH (t:Toponym {_id: $_id})
                    MERGE (tp:Type {Name: $typeName})
                    MERGE (t)-[:HAVE_TYPE]->(tp)
                    """,
                    _id=toponym["_id"],
                    typeName=type
                )

            for architect in toponym["architects"]:
                session.run(
                    """
                    MATCH (t:Toponym {_id: $_id})
                    MERGE (a:Architect {Name: $architectName})
                    MERGE (t)-[:BUILT]->(a)
                    """,
                    _id=toponym["_id"],
                    architectName=architect
                )

            for photo_url in toponym["photos"]:
                session.run(
                    """
                    MATCH (t:Toponym {_id: $_id})
                    MERGE (p:Photo {PhotoUrl: $photoUrl})
                    MERGE (t)-[:HAS_PHOTO]->(p)
                    """,
                    _id=toponym["_id"],
                    photoUrl=photo_url
                )

            for name_record in toponym["nameRecords"]:
                session.run(
                    """
                    MERGE (n:NameRecord {Name: $name, EffectiveDateFrom: $dateFrom})
                    WITH n
                    MATCH (t:Toponym {_id: $_id})
                    MERGE (t)-[:RENAMED]->(n)
                    """,
                    _id=toponym["_id"],
                    name=name_record["Name"],
                    dateFrom=name_record["EffectiveDateFrom"]
                )

    return jsonify({"message": "Data imported successfully"}), 200

@app.route('/api/export', methods=['GET'])
def export_data():
    with driver.session() as session:
        result = session.run(
            """
            MATCH (t:Toponym)
            OPTIONAL MATCH (t)-[:STYLED]->(s:Style)
            OPTIONAL MATCH (t)-[:BUILT]->(a:Architect)
            OPTIONAL MATCH (t)-[:HAVE_TYPE]->(tp:Type)
            OPTIONAL MATCH (t)-[:HAS_PHOTO]->(p:Photo)
            OPTIONAL MATCH (t)-[:RENAMED]->(nr:NameRecord)
            RETURN t._id AS id, t.Address AS address, t.ConstructionDateFrom AS constructionDateFrom,
                   t.ConstructionDateTo AS constructionDateTo, t.BriefDescription AS briefDescription,
                   t.Point.latitude AS latitude, t.Point.longitude AS longitude, t.Point.crs AS crs,
                   COLLECT(DISTINCT s.Name) AS styles, COLLECT(DISTINCT tp.Name) AS types,
                   COLLECT(DISTINCT a.Name) AS architects, COLLECT(DISTINCT p.PhotoUrl) AS photos,
                   COLLECT(DISTINCT {Name: nr.Name, EffectiveDateFrom: nr.EffectiveDateFrom}) AS nameRecords
            """
        )

        output = BytesIO()
        text_output = TextIOWrapper(output, encoding='utf-8', newline='')  # Обертка для работы с текстом
        writer = csv.writer(text_output, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["id", "address", "constructionDateFrom", "constructionDateTo", "briefDescription",
                         "latitude", "longitude", "crs", "styles", "types", "architects", "photos", "nameRecords"])

        for record in result:
            writer.writerow([
                record["id"], record["address"], record["constructionDateFrom"],
                record["constructionDateTo"], record["briefDescription"], record["latitude"],
                record["longitude"], record["crs"], json.dumps(record["styles"]),
                json.dumps(record["types"]), json.dumps(record["architects"]),
                json.dumps(record["photos"]), json.dumps(record["nameRecords"])
            ])

        text_output.flush()  
        output.seek(0)
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name='toponyms.csv'
        )


if __name__ == "__main__":
    app.run(debug=True, port=5001)