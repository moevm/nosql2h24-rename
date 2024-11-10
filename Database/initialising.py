from neo4j import GraphDatabase

# Параметры подключения
uri = "bolt://localhost:7687"  # URL сервера Neo4j (по умолчанию localhost и порт 7687)
username = "neo4j"             # Имя пользователя для входа
password = "12345678"     # Пароль для входа

# Создаем драйвер для подключения к базе данных
driver = GraphDatabase.driver(uri, auth=(username, password))

# Функция для выполнения запроса
def create_and_query_database():
    with driver.session() as session:
        # Создаем узел в базе данных
        session.run("CREATE (n:Person {name: 'Alice'})")
        
        # Запрашиваем узел
        result = session.run("MATCH (n:Person) RETURN n.name AS name")
        for record in result:
            print(record["name"])

# Запускаем функцию
create_and_query_database()

# Закрываем драйвер после работы с базой
driver.close()
