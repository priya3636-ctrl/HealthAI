import sqlite3
from pathlib import Path
from datetime import datetime


# ============================================================
# DATABASE PATH
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BACKEND_DIR / "database"

DATABASE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_PATH = DATABASE_DIR / "healthai.db"


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_connection():

    connection = sqlite3.connect(
        DATABASE_PATH,
        check_same_thread=False
    )

    connection.row_factory = sqlite3.Row

    return connection


# ============================================================
# CREATE TABLES
# ============================================================

def initialize_database():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            symptoms TEXT NOT NULL,

            matched_symptoms TEXT NOT NULL,

            best_disease TEXT NOT NULL,

            best_score REAL NOT NULL,

            strength TEXT NOT NULL,

            created_at TEXT NOT NULL

        )
        """
    )

    connection.commit()

    connection.close()


# ============================================================
# SAVE PREDICTION
# ============================================================

def save_prediction(
    symptoms,
    matched_symptoms,
    best_disease,
    best_score,
    strength
):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO predictions (
            symptoms,
            matched_symptoms,
            best_disease,
            best_score,
            strength,
            created_at
        )

        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            ", ".join(symptoms),
            ", ".join(matched_symptoms),
            best_disease,
            best_score,
            strength,
            datetime.now().isoformat(timespec="seconds")
        )
    )

    connection.commit()

    prediction_id = cursor.lastrowid

    connection.close()

    return prediction_id


# ============================================================
# GET PREDICTION HISTORY
# ============================================================

def get_prediction_history(limit=50):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            symptoms,
            matched_symptoms,
            best_disease,
            best_score,
            strength,
            created_at

        FROM predictions

        ORDER BY id DESC

        LIMIT ?
        """,
        (limit,)
    )

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


# ============================================================
# GET SINGLE PREDICTION
# ============================================================

def get_prediction(prediction_id):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            symptoms,
            matched_symptoms,
            best_disease,
            best_score,
            strength,
            created_at

        FROM predictions

        WHERE id = ?
        """,
        (prediction_id,)
    )

    row = cursor.fetchone()

    connection.close()

    if row is None:
        return None

    return dict(row)


# ============================================================
# DELETE PREDICTION
# ============================================================

def delete_prediction(prediction_id):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM predictions

        WHERE id = ?
        """,
        (prediction_id,)
    )

    deleted = cursor.rowcount > 0

    connection.commit()

    connection.close()

    return deleted


# ============================================================
# INITIALIZE DATABASE
# ============================================================

initialize_database()