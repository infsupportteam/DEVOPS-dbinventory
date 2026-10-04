FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN groupadd -g 10001 appgroup && useradd -u 10001 -g 10001 -M -s /usr/sbin/nologin appuser && chmod +x /app/entrypoint.sh && chown -R 10001:10001 /app

USER 10001:10001

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
