import json
import csv
import uuid
from flask import Flask, request, jsonify, send_file
from neo4j import GraphDatabase
from io import BytesIO, TextIOWrapper
from flask_cors import CORS
from io import StringIO
import os


uri = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
auth = os.getenv("NEO4J_AUTH", "neo4j/12345678").split('/')
username = auth[0]
password = auth[1]

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
      AND ($architect IS NULL OR ANY(architect IN architects WHERE toLower(architect) CONTAINS toLower($architect)))
      AND ($hasPhoto IS NULL OR hasPhotoFlag = $hasPhoto)
      AND ($renamedDateFrom IS NULL OR ALL(year IN renameYears WHERE year >= $renamedDateFrom))
      AND ($renamedDateTo IS NULL OR ALL(year IN renameYears WHERE year <= $renamedDateTo))
      AND ($address IS NULL OR toLower(t.Address) CONTAINS toLower($address))
      AND ($name IS NULL OR toLower(COALESCE(latestName, t.BriefDescription)) CONTAINS toLower($name))
      AND ($cardSearch IS NULL OR (
            toLower(t.Address) CONTAINS toLower($cardSearch) OR
            toLower(t.BriefDescription) CONTAINS toLower($cardSearch) OR
            ANY(style_param IN styles WHERE toLower(style_param) CONTAINS toLower($cardSearch)) OR
            ANY(type_param IN types WHERE toLower(type_param) CONTAINS toLower($cardSearch)) OR
            ANY(architect IN architects WHERE toLower(architect) CONTAINS toLower($cardSearch)) OR
            ANY(year in renameYears WHERE toString(year) CONTAINS $cardSearch)
          ))
      AND ($constructionDateFrom IS NULL OR t.ConstructionDateFrom >= $constructionDateFrom)
      AND ($constructionDateTo IS NULL OR t.ConstructionDateTo <= $constructionDateTo)
    RETURN t._id AS id,
           COALESCE(latestName, t.BriefDescription) AS name,
           t.BriefDescription AS briefDescription,
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
        "address": filters.get("address"),
        "name": filters.get("name"),
        "constructionDateFrom": filters.get("constructionDateFrom"),
        "constructionDateTo": filters.get("constructionDateTo")
    }

    with driver.session() as session:
        result = session.run(query, **parameters)
        toponyms = []
        for record in result:
            toponyms.append({
                "id": record["id"],
                "name": record["name"],
                "briefDescription": record["briefDescription"],  # Добавлено
                "renameYears": record["renameYears"],
                "address": record["address"],
                "photoUrl": record["photoUrl"] if record["photoUrl"] else None,
                "type": record["types"],
                "style": record["styles"],
                "architect": record["architects"]
            })
        return toponyms

@app.route('/api/toponyms_by_id', methods=['POST'])
def get_toponym_by_id():
    data = request.json
    toponym_id = data.get("id") 

    if not toponym_id:
        return jsonify({"error": "Parameter 'id' is required"}), 400

    query = """
    MATCH (t:Toponym {_id: $id})
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
         COLLECT(DISTINCT p.PhotoUrl) AS photoUrls, 
         COLLECT(DISTINCT {
            name: nr.Name,
            year: CASE
                      WHEN nr.EffectiveDateFrom IS NOT NULL AND nr.EffectiveDateFrom <> '' THEN
                          toInteger(substring(toString(nr.EffectiveDateFrom), 0, 4))
                      ELSE NULL
                  END
         }) AS renameDetails,
         HEAD(COLLECT(nr.Name)) AS latestName
    RETURN t._id AS id,
           COALESCE(latestName, t.BriefDescription) AS name,
           t.BriefDescription AS briefDescription,
           [detail IN renameDetails WHERE detail.year IS NOT NULL | detail.year] AS renameYears,
           renameDetails AS renames,
           t.Address AS address,
           photoUrls,  
           types,
           styles,
           architects
    """
    parameters = {"id": toponym_id}

    with driver.session() as session:
        record = session.run(query, **parameters).single()
        if record:
            toponym = {
                "id": record["id"],
                "name": record["name"],
                "briefDescription": record["briefDescription"],
                "renameYears": record["renameYears"],
                "renames": record["renames"],
                "address": record["address"],
                "photoUrls": record["photoUrls"],  # Добавляем массив URL
                "type": record["types"],
                "style": record["styles"],
                "architect": record["architects"]
            }
            return jsonify(toponym)
        else:
            return jsonify({"error": "Toponym not found"}), 404





@app.route('/api/toponyms', methods=['POST'])
def get_toponyms():
    filters = request.json  
    toponyms = filter_toponyms(filters)
    return jsonify(toponyms)

def clear_database():
    """Удаляет все данные из базы данных."""
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

def import_toponyms(file_path):
    """Импортирует данные из файла JSON."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        if "toponyms" not in data or not isinstance(data["toponyms"], list):
            raise ValueError("Invalid JSON structure. Expected 'toponyms' key with a list of toponyms.")

        with driver.session() as session:
            def import_tx(tx):
                for toponym in data["toponyms"]:
                    toponym_id = str(uuid.uuid4())

                    tx.run(
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
                        _id=toponym_id,
                        address=toponym["Address"],
                        constructionDateFrom=toponym.get("ConstructionDateFrom"),
                        constructionDateTo=toponym.get("ConstructionDateTo"),
                        briefDescription=toponym["BriefDescription"],
                        latitude=toponym["Point"]["latitude"],
                        longitude=toponym["Point"]["longitude"],
                        crs=toponym["Point"]["crs"]
                    )

                    for style in toponym.get("style", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (s:Style {Name: $styleName})
                            MERGE (t)-[:STYLED]->(s)
                            """,
                            _id=toponym_id,
                            styleName=style
                        )

                    for type_name in toponym.get("types", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (tp:Type {Name: $typeName})
                            MERGE (t)-[:HAVE_TYPE]->(tp)
                            """,
                            _id=toponym_id,
                            typeName=type_name
                        )

                    for architect in toponym.get("architects", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (a:Architect {Name: $architectName})
                            MERGE (t)-[:BUILT]->(a)
                            """,
                            _id=toponym_id,
                            architectName=architect
                        )

                    for photo_url in toponym.get("photos", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (p:Photo {PhotoUrl: $photoUrl})
                            MERGE (t)-[:HAS_PHOTO]->(p)
                            """,
                            _id=toponym_id,
                            photoUrl=photo_url
                        )

                    for name_record in toponym.get("nameRecords", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (n:NameRecord {Name: $name, EffectiveDateFrom: $dateFrom})
                            MERGE (t)-[:RENAMED]->(n)
                            """,
                            _id=toponym_id,
                            name=name_record["Name"],
                            dateFrom=name_record.get("EffectiveDateFrom")
                        )

            session.write_transaction(import_tx)
        print("Data imported successfully.")

    except Exception as e:
        print(f"Error during data import: {e}")

@app.route('/api/import', methods=['POST'])
def import_data():
    """Импортирует данные из загруженного файла JSON и возвращает количество добавленных записей."""
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    try:
        data = json.loads(file.read().decode('utf-8'))
    except UnicodeDecodeError:
        try:
            file.seek(0)
            data = json.loads(file.read().decode('windows-1251'))
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            return jsonify({"error": "Invalid file format or encoding. Supported encodings: UTF-8, Windows-1251.", "details": str(e)}), 400
    except json.JSONDecodeError as e:
        return jsonify({"error": "Invalid JSON format.", "details": str(e)}), 400

    if "toponyms" not in data or not isinstance(data["toponyms"], list):
        return jsonify({"error": "Invalid JSON structure. Expected 'toponyms' key with a list of toponyms."}), 400

    try:
        with driver.session() as session:
            def import_tx(tx):
                added_count = 0
                for toponym in data["toponyms"]:
                    toponym_id = str(uuid.uuid4())

                    result = tx.run(
                        """
                        MERGE (t:Toponym {_id: $_id})
                        ON CREATE SET
                            t.Address = $address,
                            t.ConstructionDateTo = $constructionDateTo,
                            t.ConstructionDateFrom = $constructionDateFrom,
                            t.BriefDescription = $briefDescription,
                            t.Point = point({latitude: $latitude, longitude: $longitude, crs: $crs})
                        RETURN t
                        """,
                        _id=toponym_id,
                        address=toponym.get("Address"),
                        constructionDateFrom=toponym.get("ConstructionDateFrom"),
                        constructionDateTo=toponym.get("ConstructionDateTo"),
                        briefDescription=toponym.get("BriefDescription"),
                        latitude=toponym["Point"].get("latitude"),
                        longitude=toponym["Point"].get("longitude"),
                        crs=toponym["Point"].get("crs")
                    )

                    if result.single():  # Если запись создана
                        added_count += 1

                    for style in toponym.get("style", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (s:Style {Name: $styleName})
                            MERGE (t)-[:STYLED]->(s)
                            """,
                            _id=toponym_id,
                            styleName=style
                        )

                    for type_name in toponym.get("types", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (tp:Type {Name: $typeName})
                            MERGE (t)-[:HAVE_TYPE]->(tp)
                            """,
                            _id=toponym_id,
                            typeName=type_name
                        )

                    for architect in toponym.get("architects", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (a:Architect {Name: $architectName})
                            MERGE (t)-[:BUILT]->(a)
                            """,
                            _id=toponym_id,
                            architectName=architect
                        )

                    for photo_url in toponym.get("photos", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (p:Photo {PhotoUrl: $photoUrl})
                            MERGE (t)-[:HAS_PHOTO]->(p)
                            """,
                            _id=toponym_id,
                            photoUrl=photo_url
                        )

                    for name_record in toponym.get("nameRecords", []):
                        tx.run(
                            """
                            MATCH (t:Toponym {_id: $_id})
                            MERGE (n:NameRecord {Name: $name, EffectiveDateFrom: $dateFrom})
                            MERGE (t)-[:RENAMED]->(n)
                            """,
                            _id=toponym_id,
                            name=name_record.get("Name"),
                            dateFrom=name_record.get("EffectiveDateFrom")
                        )

                return added_count

            added_records = session.write_transaction(import_tx)

        return jsonify({"message": "Data imported successfully.", "addedRecords": added_records}), 200

    except Exception as e:
        return jsonify({"error": "An error occurred during data import.", "details": str(e)}), 500



@app.route('/api/export', methods=['GET'])
def export_data():
    """Экспортирует данные из базы данных в формате JSON с поддержкой русских символов."""
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

        toponyms = []

        for record in result:
            toponym = {
                "_id": record["id"],
                "Address": record["address"],
                "ConstructionDateFrom": record["constructionDateFrom"],
                "ConstructionDateTo": record["constructionDateTo"],
                "BriefDescription": record["briefDescription"],
                "Point": {
                    "latitude": record["latitude"],
                    "longitude": record["longitude"],
                    "crs": record["crs"]
                },
                "style": record["styles"],
                "types": record["types"],
                "architects": record["architects"],
                "photos": record["photos"],
                "nameRecords": record["nameRecords"]
            }
            toponyms.append(toponym)

        response = app.response_class(
            response=json.dumps({"toponyms": toponyms}, ensure_ascii=False, indent=2),
            status=200,
            mimetype='application/json'
        )
        return response



if __name__ == "__main__":
    clear_database() 
    import_toponyms("db/toponyms_data.json")
    app.run(debug=True, port=5001, host='0.0.0.0')
