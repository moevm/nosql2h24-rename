FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py /app/app.py

VOLUME ["/app/db"]

ENV NEO4J_URI=bolt://neo4j:7687
ENV NEO4J_USER=neo4j
ENV NEO4J_PASSWORD=12345678

CMD ["python", "app.py"]
