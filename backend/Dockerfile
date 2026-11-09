# ---------- Étape 1 : installation des dépendances ----------
FROM python:3.12-slim AS builder

# Les dépendances sont installées dans un venv, qu'on copiera tel quel dans l'image finale
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# On copie d'abord UNIQUEMENT la liste des dépendances :
# tant qu'elle ne change pas, Docker réutilise cette couche en cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# ---------- Étape 2 : image finale, le strict nécessaire ----------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Utilisateur sans droits root
RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /app \
    && chown appuser:appuser /app

WORKDIR /app

# On récupère seulement le venv de l'étape 1 (pas pip cache, pas les outils de build)
COPY --from=builder /opt/venv /opt/venv
# Puis le code de l'application (sans les tests)
COPY app ./app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]