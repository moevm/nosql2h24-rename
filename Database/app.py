import json
from flask import Flask, request, jsonify
from neo4j import GraphDatabase

# Подключение к Neo4j
uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"
driver = GraphDatabase.driver(uri, auth=(username, password))

app = Flask(__name__)

# Функция для выполнения запроса и фильтрации данных
def filter_toponyms(filters):
    query = """
    MATCH (t)-[:STYLED]->(s:Style)
    MATCH (t)-[:BUILT]->(a:Architect)
    MATCH (t)-[:HAVE_TYPE]->(tp:Type)
    WHERE ($type IS NULL OR tp.Name IN $type)
      AND ($style IS NULL OR s.Name IN $style)
      AND ($architect IS NULL OR a.Name = $architect)
    RETURN t.Address AS address, t.BriefDescription AS briefDescription, t.ConstructionDateTo AS constructionDateTo,
    t.Point as point, s.Name as style, tp.Name as typ
    """
    parameters = {
        "type": filters.get("type"),
        "style": filters.get("style"),
        "architect": filters.get("architect")
    }
    with driver.session() as session:
        result = session.run(query, **parameters)
        toponyms = []
        for record in result:
            print(record["briefDescription"])
            toponyms.append({
                "name": record["briefDescription"],
                "address": record["address"],
                "point": record["point"] if record["point"] else "",
                "constructionDateTo": record["constructionDateTo"],
                "style": record["style"]
                
            })
            print(toponyms)
        return toponyms

# Endpoint для фильтрации
@app.route('/api/toponyms', methods=['GET'])
def get_toponyms():
    filters = request.json  # Получаем JSON-фильтры из запроса
    toponyms = filter_toponyms(filters)
    return jsonify(toponyms)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
