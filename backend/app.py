import json
from flask import Flask, request, jsonify
from neo4j import GraphDatabase
from flask_cors import CORS

# Подключение к Neo4j
uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"
driver = GraphDatabase.driver(uri, auth=(username, password))

app = Flask(__name__)
CORS(app, support_credintials=True)
def filter_toponyms(filters):
    LIMIT = 5  # Константа для количества записей на странице
    page = filters.get("page", 0)  # Получаем номер страницы из фильтров, по умолчанию 0
    skip = page * LIMIT  # Вычисляем количество записей, которые нужно пропустить

    # Преобразуем параметры в списки, если они не являются списками
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
      AND ($renamedTo IS NULL OR ANY(year IN renameYears WHERE year = $renamedTo))
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
        "renamedTo": int(filters.get("renamedTo")) if filters.get("renamedTo") else None,
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



# Endpoint для фильтрации
@app.route('/api/toponyms', methods=['POST'])
def get_toponyms():
    filters = request.json  # Получаем JSON-фильтры из запроса
    toponyms = filter_toponyms(filters)
    return jsonify(toponyms)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
