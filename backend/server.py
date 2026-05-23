import sqlite3
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

DB_NAME = r"C:\Users\dorsa\Downloads\studymatch-app copie(1)\studymatch-app copie\backend\students.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME) 
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient_id TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT,
            annonce_id INTEGER,
            is_read INTEGER DEFAULT 0
        )
    ''')
    
    # Table existante : students
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prenom TEXT,
            nom TEXT,
            idEtudiant TEXT UNIQUE,
            ufr TEXT,
            annee TEXT,
            methode TEXT,
            fiabilite INTEGER,
            interests TEXT,
            pointsForts TEXT,
            pointsFaibles TEXT,
            dispos TEXT,
            motDePasse TEXT
        )
    ''')
    
    # Table existante : requests
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id TEXT,
            receiver_id TEXT,
            status TEXT DEFAULT 'pending'
        )
    ''')

    # AJOUTE CE BLOC ICI :
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id TEXT NOT NULL,
            user2_id TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

OTHER_STUDENTS = [
    {
        "nom": "Marie Curie", "matiere": "Mathématiques", "ufr": "SEGMI", "groupeTD": "TD4", "fiabilite": 95,
        "methode": "Solo / Calme", "interests": ["Gaming", "Musique"],
        "pointsForts": ["Mathématiques", "Informatique"], "pointsFaibles": ["Économie"],
        "dispos": {"Lun": ["08h-10h"], "Mar": ["14h-16h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []}
    },
    {
        "nom": "Jean Tirole", "matiere": "Économie", "ufr": "SEGMI", "groupeTD": "TD1", "fiabilite": 90,
        "methode": "En groupe / Bibli", "interests": ["Sport", "Cinéma"],
        "pointsForts": ["Économie", "Management"], "pointsFaibles": ["Informatique"],
        "dispos": {"Lun": ["10h-12h"], "Mar": ["16h-18h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []}
    },
    {
        "nom": "Ada Lovelace", "matiere": "Informatique", "ufr": "SITEC", "groupeTD": "TD12", "fiabilite": 98,
        "methode": "Proactif / Organisé", "interests": ["Gaming", "Musique"],
        "pointsForts": ["Informatique", "Mathématiques"], "pointsFaibles": ["Philosophie"],
        "dispos": {"Lun": ["14h-16h"], "Mar": ["08h-10h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []}
    },
    {
        "nom": "Blaise Pascal", "matiere": "Mathématiques", "ufr": "SEGMI", "groupeTD": "TD3", "fiabilite": 92,
        "methode": "Solo / Calme", "interests": ["Littérature", "Cinéma"],
        "pointsForts": ["Mathématiques", "Droit"], "pointsFaibles": ["Anglais"],
        "dispos": {"Lun": ["08h-10h"], "Mar": ["10h-12h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []}
    },
    {
        "nom": "Alan Turing", "matiere": "Informatique", "ufr": "SITEC", "groupeTD": "TD9", "fiabilite": 99,
        "methode": "Proactif / Organisé", "interests": ["Gaming", "Sport"],
        "pointsForts": ["Informatique", "Anglais"], "pointsFaibles": ["Économie"],
        "dispos": {"Lun": ["14h-16h"], "Mar": ["16h-18h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []}
    },
    {
        "nom": "Simone de Beauvoir", "matiere": "Philosophie", "ufr": "PHILLIA", "groupeTD": "TD7", "fiabilite": 94,
        "methode": "En groupe / Bibli", "interests": ["Littérature", "Musique"],
        "pointsForts": ["Philosophie", "Français"], "pointsFaibles": ["Mathématiques"],
        "dispos": {"Lun": ["10h-12h"], "Mar": ["14h-16h"], "Mer": [], "Jeu": [], "Ven": [], "Sam": [], "Dim": []}
    }
]

def calculer_compatibilite(user1, user2):
    score = 0
   
    # 1. UFR (30%)
    if user1.get('ufr') == user2.get('ufr'):
        score += 30
       
    # 2. Passions communes (15%)
    # Si au moins une passion commune, on donne les 15 points
    if set(user1.get('interests', [])) & set(user2.get('interests', [])):
        score += 15
       
    # 3. Style de travail (25%)
    if user1.get('methode') == user2.get('methode'):
        score += 25
       
    # 4. Disponibilités (30%)
    # On compare le nombre de créneaux communs sur toute la semaine
    communs = 0
    for jour in user1.get('dispos', {}):
        slots1 = set(user1['dispos'][jour])
        slots2 = set(user2.get('dispos', {}).get(jour, []))
        communs += len(slots1 & slots2)
   
    # On donne les 30% si au moins 2 créneaux sont communs
    if communs >= 2:
        score += 30
    elif communs == 1:
        score += 15
       
    return min(score, 100)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    id_etudiant = data.get('idEtudiant')
    password = data.get('motDePasse')
    print(f"DEBUG: Tentative de login pour {id_etudiant} avec mot de passe '{password}'")

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # On vérifie si l'étudiant existe
    cursor.execute("SELECT * FROM students WHERE idEtudiant = ?", (id_etudiant,))
    user = cursor.fetchone()
    conn.close()

    if user and user['motDePasse'] == password:
        return jsonify({"user": dict(user)}), 200
    else:
        return jsonify({"error": "Numéro étudiant ou mot de passe incorrect"}), 401

@app.route('/api/get-requests/<student_id>', methods=['GET'])
def get_requests(student_id):
    try:
        conn = get_db_connection()
        
        # 1. Récupérer les demandes de binômes (table requests)
        requests = conn.execute("SELECT * FROM requests WHERE receiver_id = ?", (student_id,)).fetchall()
        
        # 2. Récupérer les notifications (table notifications)
        notifs = conn.execute("SELECT * FROM notifications WHERE recipient_id = ? AND is_read = 0", (student_id,)).fetchall()
        
        results = []
        
        # Traitement des demandes (ton code existant)
        for req in requests:
            sender = conn.execute("SELECT * FROM students WHERE idEtudiant = ?", (req['sender_id'],)).fetchone()
            if sender:
                sender_dict = dict(sender)
                results.append({
                    "sender_id": req['sender_id'],
                    "sender_firstname": sender_dict['prenom'],
                    "sender_name": sender_dict['nom'],
                    "sender_avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={sender_dict['nom']}",
                    "type": "binome"
                })

        # Ajout des notifications de tutorat (nouveau !)
        for n in notifs:
            results.append({
                "message": n['message'],
                "type": n['type'],
                "annonce_id": n['annonce_id']
            })
            
        conn.close()
        return jsonify(results)
        
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return jsonify([]), 200
    
@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    id_etudiant = data.get('idEtudiant')
    nouveau_mdp = data.get('nouveauMotDePasse')
    
    print(f"DEBUG: Tentative de reset pour l'ID : '{id_etudiant}'")

    if not id_etudiant or not nouveau_mdp:
        return jsonify({"error": "Données incomplètes"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Vérifier si l'utilisateur existe
        # On utilise une requête simple. Si ton ID est un texte, assure-toi qu'il correspond exactement.
        cursor.execute("SELECT id FROM students WHERE idEtudiant = ?", (id_etudiant.strip(),))
        user = cursor.fetchone()

        if not user:
            conn.close()
            print(f"DEBUG: Aucun compte trouvé pour {id_etudiant}")
            return jsonify({"error": "Aucun compte trouvé avec ce numéro étudiant."}), 404

        # 2. Mettre à jour le mot de passe
        cursor.execute("UPDATE students SET motDePasse = ? WHERE idEtudiant = ?", 
                       (nouveau_mdp, id_etudiant.strip()))
        conn.commit()
        conn.close()

        print(f"DEBUG: Mot de passe mis à jour pour {id_etudiant}")
        return jsonify({"message": "Mot de passe modifié avec succès !"}), 200

    except Exception as e:
        print(f"DEBUG: Erreur serveur lors du reset : {e}")
        return jsonify({"error": "Erreur interne du serveur."}), 500
    
@app.route('/api/debug-requests', methods=['GET'])
def debug_requests():
    conn = get_db_connection()
    reqs = conn.execute("SELECT * FROM requests").fetchall()
    return jsonify([dict(r) for r in reqs])

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"message": "OK"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
@app.route('/api/update-profile', methods=['POST', 'OPTIONS'])
def handle_update_profile():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    return update_profile()

@app.route('/api/add-match', methods=['POST'])
def add_match():
    data = request.json
    conn = get_db_connection()
    
    # Vérifier si le match existe déjà (dans les deux sens)
    existing = conn.execute('''
        SELECT * FROM matches 
        WHERE (user1_id = ? AND user2_id = ?) 
        OR (user1_id = ? AND user2_id = ?)
    ''', (data['user_id'], data['match_id'], data['match_id'], data['user_id'])).fetchone()
    
    if existing:
        conn.close()
        return jsonify({"message": "Déjà binôme !"}), 400
        
    conn.execute("INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)", 
                 (data['user_id'], data['match_id']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Binôme ajouté !"}), 200

@app.route('/api/get-matches/<student_id>', methods=['GET'])
def get_matches(student_id):
    conn = get_db_connection()
    # On récupère les binômes où l'étudiant est soit user1 soit user2
    matches = conn.execute("""
        SELECT s.* FROM students s
        JOIN matches m ON (s.idEtudiant = m.user1_id OR s.idEtudiant = m.user2_id)
        WHERE (m.user1_id = ? OR m.user2_id = ?) 
        AND s.idEtudiant != ?
    """, (student_id, student_id, student_id)).fetchall()
    
    # Conversion en liste de dictionnaires
    results = [dict(row) for row in matches]
    conn.close()
    return jsonify(results)

@app.route('/api/delete-request/<sender_id>/<receiver_id>', methods=['DELETE'])
def delete_request(sender_id, receiver_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM requests WHERE sender_id = ? AND receiver_id = ?", (sender_id, receiver_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Supprimé avec succès"}), 200

@app.route('/api/accept-request/<sender_id>/<receiver_id>', methods=['DELETE'])
def accept_request(sender_id, receiver_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM requests WHERE sender_id = ? AND receiver_id = ?", (sender_id, receiver_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Binôme accepté et demande supprimée"}), 200

@app.route('/api/send-request', methods=['POST'])
def send_request():
    data = request.json
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM requests WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'", 
                       (sender_id, receiver_id))
        if cursor.fetchone():
            return jsonify({"message": "Demande déjà envoyée !"}), 400
        
        cursor.execute("INSERT INTO requests (sender_id, receiver_id) VALUES (?, ?)", 
                       (sender_id, receiver_id))
        conn.commit()
        return jsonify({"message": "Demande envoyée !"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- FONCTION POUR RÉCUPÉRER TOUS LES ÉTUDIANTS (SQL + EXEMPLES) ---
def get_all_students_from_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM students')
    rows = cursor.fetchall()
    conn.close()
    
    # Conversion des lignes SQL en dictionnaires
    db_students = []
    for row in rows:
        db_students.append({
            "nom": f"{row[1]} {row[2]}",
            "idEtudiant": row[3],
            "ufr": row[4],
            "methode": row[6],
            "fiabilite": row[7],
            "interests": json.loads(row[8]),
            "pointsForts": json.loads(row[9]),
            "pointsFaibles": json.loads(row[10]),
            "dispos": json.loads(row[11])
        })
    return db_students

@app.route('/api/students', methods=['GET'])
def get_all_students_api():
    students = get_all_students_from_db() # Utilise ta fonction existante
    return jsonify(students)

# --- ROUTES ---

@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    data = request.json
    id_etudiant = data.get('idEtudiant')

    if not id_etudiant:
        return jsonify({"error": "ID étudiant manquant"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # On met à jour tous les champs modifiables
        # Note: On utilise json.dumps pour les champs qui sont des listes ou objets (interests, dispos...)
        query = '''
            UPDATE students 
            SET prenom = ?, nom = ?, ufr = ?, annee = ?, methode = ?, 
                interests = ?, pointsForts = ?, pointsFaibles = ?, dispos = ?, motDePasse = ?
            WHERE idEtudiant = ?
        '''
        
        values = (
            data.get('prenom'), 
            data.get('nom'), 
            data.get('ufr'), 
            data.get('annee'), 
            data.get('methode'), 
            json.dumps(data.get('interests', [])), 
            json.dumps(data.get('pointsForts', [])), 
            json.dumps(data.get('pointsFaibles', [])), 
            json.dumps(data.get('dispos', {})), 
            data.get('motDePasse'),
            id_etudiant
        )
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Profil mis à jour avec succès"}), 200

    except Exception as e:
        print(f"Erreur lors de la mise à jour : {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Récupération sécurisée des données avec valeur par défaut si besoin
    prenom = data.get('prenom')
    nom = data.get('nom')
    idEtudiant = data.get('idEtudiant')
    ufr = data.get('ufr')
    annee = data.get('annee')
    
    # FIX : On s'assure qu'une méthode est définie
    methode = data.get('methode')
    if not methode or methode == "":
        methode = "Solo / Calme"
        
    motDePasse = data.get('motDePasse')
    interests = data.get('interests', [])
    pointsForts = data.get('pointsForts', [])
    pointsFaibles = data.get('pointsFaibles', [])
    dispos = data.get('dispos', {})

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    try:
        query = '''
            INSERT INTO students (
                prenom, nom, idEtudiant, ufr, annee, methode, 
                fiabilite, interests, pointsForts, pointsFaibles, 
                dispos, motDePasse
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        values = (
            prenom, nom, idEtudiant, ufr, annee, methode, 90, 
            json.dumps(interests), 
            json.dumps(pointsForts), 
            json.dumps(pointsFaibles),
            json.dumps(dispos),
            motDePasse
        )
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        return jsonify({"message": "OK"}), 200

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Ce numéro étudiant est déjà utilisé."}), 409

    except Exception as e:
        conn.close()
        print("DEBUG - ERREUR GÉNÉRALE :", e)
        return jsonify({"error": str(e)}), 400

@app.route('/api/get-all-matches', methods=['POST'])
def get_all_matches():
    user_connecte = request.json['user']
    # On combine les profils "exemples" (OTHER_STUDENTS) et ceux de la BDD
    tous_les_etudiants = OTHER_STUDENTS + get_all_students_from_db()
    
    matches = []
    for s in tous_les_etudiants:
        if s.get('idEtudiant') == user_connecte.get('idEtudiant'):
            continue
        
        score = calculer_compatibilite(user_connecte, s)
        s['score'] = score
        matches.append(s)
        
    return jsonify(matches)

@app.route('/api/cleanup-doublons', methods=['GET'])
def cleanup():
    conn = get_db_connection()
    # On exécute la suppression des doublons
    conn.execute('''
        DELETE FROM requests 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM requests 
            GROUP BY sender_id, receiver_id
        )
    ''')
    conn.commit()
    conn.close()
    return "Base de données nettoyée avec succès !"

@app.route('/api/send-notification', methods=['POST'])
def send_notification():
    data = request.json
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO notifications (recipient_id, message, type, annonce_id)
            VALUES (?, ?, ?, ?)
        ''', (data['recipient_id'], data['message'], data['type'], data.get('annonce_id')))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 201
    except Exception as e:
        print(f"Erreur enregistrement notif : {e}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(port=5000, debug=False)