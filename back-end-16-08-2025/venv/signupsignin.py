@app.post("/signup")
def signupuser(payload: Dict[str, Any]):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        email = payload.get("email")
        password = payload.get("password")
        name = payload.get("name")

        print("name",name)
        print("email",email)
    

        # password_bytes = password.encode("utf-8")[:72]

        # # 2) Hash password (bcrypt)
        # password_hash = pwd_ctx.hash(password_bytes)

        # 1) Truncate to 72 bytes (bcrypt limit)
        password_bytes = password.encode("utf-8")[:72]

        # 2) Decode back to string before hashing
        password_str = password_bytes.decode("utf-8", errors="ignore")

        # 3) Hash password
        password_hash = pwd_ctx.hash(password_str)

        print("pw",password_hash)

        payload_json = json.dumps({
            "name":name,
            "email": email,
            "password": password_hash
        })
        payload_str = payload_json
        print("json payload",payload_str)

          # Prepare OUT variable
        cursor.execute("SET @result_json = NULL;")

        # Call procedure with IN JSON and OUT param
        cursor.execute("CALL manage_user_signup(%s, @result_json);", (payload_str,))

        # Fetch OUT JSON
        cursor.execute("SELECT @result_json AS result_json;")
        result = cursor.fetchone()

        conn.commit()

        if result and result["result_json"]:
            return json.loads(result["result_json"])
        else:
            return {"status": "error", "message": "No result returned"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#         {
#     "name": "rake2",
#     "email": "rakiemperor@gmail.com",
#     "password": "12123456"
# }
    
@app.post("/signin")
def signinuser(payload: Dict[str, Any]):
    # try:
    #     conn = get_db_connection()
    #     cursor = conn.cursor()

    #     # Hardcoded payload
    #   #  payload = {"userid": 1}  

    
    #     email = payload.get("email")
    #     password = payload.get("password")

    #     # 2) Hash password (bcrypt)
    #     password_hash = pwd_ctx.hash(password)

    #     payload_json = json.dumps({
    #         "email": email,
    #         "password": password_hash
    #     })

    #     payload_str = payload_json

    #     # Prepare OUT variable
    #     cursor.execute("SET @result_json = NULL;")

    #     # Call procedure
    #     cursor.execute("CALL manage_signin(%s, @result_json);", (payload_str,))
    #     cursor.execute("SELECT @result_json AS result_json;")
    #     result = cursor.fetchone()
    #     conn.commit()

    #     if not result or not result["result_json"]:
    #         raise HTTPException(status_code=400, detail="No response from DB")

    #     result_json = json.loads(result["result_json"])

    #     # Check DB response
    #     if result_json.get("status") != "success":
    #         raise HTTPException(status_code=400, detail=result_json.get("message"))

    #     # Verify password
    #     if not pwd_ctx.verify(payload_json["password"], result_json["password_hash"]):
    #         raise HTTPException(status_code=401, detail="Invalid password")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        email = payload.get("email")
        password = payload.get("password")

        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")

        # Prepare input JSON (send plain password)
        payload_json = json.dumps({
            "email": email,
            "password": password
        })

        # Prepare OUT variable
        cursor.execute("SET @result_json = NULL;")

        # Call stored procedure
        cursor.execute("CALL manage_user_signin(%s, @result_json);", (payload_json,))
        cursor.execute("SELECT @result_json AS result_json;")

        result = cursor.fetchone()
        conn.commit()

        if not result or not result["result_json"]:
            raise HTTPException(status_code=400, detail="No response from database")

        result_json = json.loads(result["result_json"])

        # Check database result
        if result_json.get("status") != "success":
            raise HTTPException(status_code=400, detail=result_json.get("message"))

        stored_hash = result_json.get("password_hash")
        if not stored_hash:
            raise HTTPException(status_code=500, detail="No password hash in database response")

        #  Verify password
        if not pwd_ctx.verify(password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        if result_json.get("status") != "success":
           raise HTTPException(status_code=400, detail=result_json.get("message"))
        
        if result and result["result_json"]:
            return json.loads(result["result_json"])
        else:
            return {"status": "error", "message": "No result returned"}


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
