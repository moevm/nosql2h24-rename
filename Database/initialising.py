from neo4j import GraphDatabase

# Параметры подключения
uri = "bolt://localhost:7687"  # URL сервера Neo4j (по умолчанию localhost и порт 7687)
username = "neo4j"             # Имя пользователя для входа
password = "12345678"     # Пароль для входа

# Создаем драйвер для подключения к базе данных
driver = GraphDatabase.driver(uri, auth=(username, password))


# Закрываем драйвер после работы с базой
driver.close()
