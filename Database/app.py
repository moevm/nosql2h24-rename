import json
from flask import Flask, request, jsonify
from neo4j import GraphDatabase

# Подключение к Neo4j
uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"
driver = GraphDatabase.driver(uri, auth=(username, password))

app = Flask(__name__)

def filter_toponyms(filters):
    LIMIT = 5  # Константа для количества записей на странице
    page = filters.get("page", 0)  # Получаем номер страницы из фильтров, по умолчанию 0
    skip = page * LIMIT  # Вычисляем количество записей, которые нужно пропустить
    
    query = """
    MATCH (t:Toponym)
    OPTIONAL MATCH (t)-[:STYLED]->(s:Style)
    OPTIONAL MATCH (t)-[:BUILT]->(a:Architect)
    OPTIONAL MATCH (t)-[:HAVE_TYPE]->(tp:Type)
    OPTIONAL MATCH (t)-[:HAS_PHOTO]->(p:Photo)
    OPTIONAL MATCH (t)-[:RENAMED]->(nr:NameRecord)
    WITH t,
         COLLECT(DISTINCT s.Name) AS styles,
         COLLECT(DISTINCT a.Name) AS architects,
         COLLECT(DISTINCT tp.Name) AS types,
         COLLECT(DISTINCT p.PhotoUrl) AS photoUrls,
         COLLECT(DISTINCT nr.EffectiveDateFrom) AS renameYears
    WHERE ($style IS NULL OR ANY(style IN styles WHERE style IN $style))
      AND ($type IS NULL OR ANY(type IN types WHERE type IN $type))
      AND ($architect IS NULL OR ANY(architect IN architects WHERE architect = $architect))
      AND ($hasPhoto IS NULL OR (SIZE(photoUrls) > 0) = $hasPhoto)
      AND ($renamedTo IS NULL OR ANY(year IN renameYears WHERE year = $renamedTo))
      AND ($cardSearch IS NULL OR (
            t.Address CONTAINS $cardSearch OR
            t.BriefDescription CONTAINS $cardSearch
          ))
      AND ($constructionDateFrom IS NULL OR t.ConstructionDateFrom >= $constructionDateFrom)
      AND ($constructionDateTo IS NULL OR t.ConstructionDateTo <= $constructionDateTo)
    RETURN t.BriefDescription AS name,
           renameYears,
           t.Address AS address,
           photoUrls,
           types,
           styles,
           architects
    SKIP $skip LIMIT $limit
    """
    
    parameters = {
        "type": filters.get("type"),
        "style": filters.get("style"),
        "hasPhoto": filters.get("hasPhoto"),
        "architect": filters.get("architect"),
        "renamedTo": filters.get("renamedTo"),
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
                "photoUrls": record["photoUrls"] if record["photoUrls"] else [],
                "type": record["types"],
                "style": record["styles"],
                "architect": record["architects"]
            })
        return toponyms



# Endpoint для фильтрации
@app.route('/api/toponyms', methods=['GET'])
def get_toponyms():
    filters = request.json  # Получаем JSON-фильтры из запроса
    toponyms = filter_toponyms(filters)
    return jsonify(toponyms)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
