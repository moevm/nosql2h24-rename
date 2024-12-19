import json
from neo4j import GraphDatabase

uri = "bolt://localhost:7687"
username = "neo4j"
password = "12345678"
driver = GraphDatabase.driver(uri, auth=(username, password))

def load_data_into_neo4j(json_file):
    with open(json_file, 'r', encoding='utf-8') as file:
        data = json.load(file)

    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

        for toponym in data["toponyms"]:
            # Создание топонима
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

load_data_into_neo4j('toponyms_data.json')

