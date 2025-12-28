from fastapi import FastAPI, HTTPException, Request, Depends
from database import get_db_connection
import json
import datetime, hashlib
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

load_dotenv()


pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

security = HTTPBearer()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    text: str

#  Verify Token Function
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # contains user data
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@app.post("/echo/")
async def echo_message(msg: Message,user = Depends(verify_token)):
    return {"received_text": msg.text}

# @app.get("/dbdata/")
# async def read_items():
#         connection = get_db_connection()
#         try:
#             with connection.cursor(pymysql.cursors.DictCursor) as cursor:
#                 sql = "SELECT * FROM userinfo"
#                 cursor.execute(sql)
#                 items = cursor.fetchall()
#             return {"items": items}
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=str(e))

@app.get("/newdata")
def get_users(user = Depends(verify_token)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id, username FROM userinfo")
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return {"users": rows}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

#Get table record for transactions record  

@app.post("/transactionsrecord")
def get_transactions_record(payload: Dict[str, Any],user = Depends(verify_token)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Hardcoded payload
        # payload = {"userid": 1}  
        user_id = user.get("user_id")
        payload["userid"] = user_id

        payload_str = json.dumps(payload)

        # Exactly like in MySQL CLI
        cursor.execute("SET @payload = %s", (payload_str,))
        cursor.execute("CALL getTransactionsRecordForTable(@payload, @result)")
        cursor.execute("SELECT @result AS result_json")
        

        out_result = cursor.fetchone()

        cursor.close()
        conn.close()


        if out_result and out_result["result_json"]:
            return json.loads(out_result["result_json"])
        else:
            return {"status": "error", "message": "No result returned from procedure"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Add new transaction record    
@app.post("/addtransaction")
def add_transaction_record(payload: Dict[str, Any],user = Depends(verify_token)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Hardcoded payload
#         payload = {"action":"update","id":2,"userid":1,"transactionType":"income","amount":15123,"category":"food","transactionDate":"2025-08-14 10:10:15",
# "transactionDescription":"spent for groceries","nextRecurringDate":"2025-08-25 10:10:15","isRecurring":1,"recurringInterval": "month" }
        user_id = user.get("user_id")
        payload["userid"] = user_id
        payload_str = json.dumps(payload)

        # Exactly like in MySQL CLI
        cursor.execute("SET @user_json = %s", (payload_str,))
        cursor.execute("CALL manage_transaction_crud(@user_json, @result_json)")
        cursor.execute("SELECT @result_json AS result_json")
      #  conn.commit()
        out_result = cursor.fetchone()

        cursor.close()
        conn.close()

        if out_result and out_result["result_json"]:
            return json.loads(out_result["result_json"])
        else:
            return {"status": "error", "message": "No result returned from procedure"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# @app.post("/editrecord")
# def get_transactions_edit_record(payload: Dict[str, Any]):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()

#         # Hardcoded payload
#         payload = {"userid": 1,"id":5}  
#         payload_str = json.dumps(payload)

#         cursor.callproc("editRecordsp", (payload_str,))
            
#             # Fetch all rows
#         rows = cursor.fetchall()
#         conn.commit()
#         cursor.close()
#         conn.close()

#         return {"orders": rows}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@app.post("/editrecord")
def get_orders(payload: dict,user = Depends(verify_token)):
    user_id = user.get("user_id")
    payload["userid"] = user_id
    filter_json = json.dumps(payload)
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.callproc("editRecordsp", (filter_json,))
            rows = cursor.fetchall()  # list of dicts
        conn.commit()
    finally:
        conn.close()

    return rows

    

@app.post("/signup")
async def signup(request: Request):
    try:
        data = await request.json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            raise HTTPException(status_code=400, detail="All fields are required")

        # Step 1️⃣ Hash password securely
      #  sha = hashlib.sha256(password.encode('utf-8')).hexdigest()
        password_hash = pwd_ctx.hash(password)

        # Step 2️⃣ Prepare JSON payload for procedure
        payload = json.dumps({
            "name": name,
            "email": email,
            "password": password_hash
        })

        conn = get_db_connection()
        cursor = conn.cursor()

        # Step 3️⃣ Call procedure
        cursor.execute("SET @result_json = NULL;")
        cursor.execute("CALL manage_user_signup(%s, @result_json);", (payload,))
        cursor.execute("SELECT @result_json AS result_json;")

        result = cursor.fetchone()
        conn.commit()

        if not result or not result["result_json"]:
            raise HTTPException(status_code=400, detail="No response from DB")

        result_json = json.loads(result["result_json"])
        return result_json

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()




# @app.post("/signin")
# async def signin(request: Request):
#     try:
#         data = await request.json()
#         email = data.get("email")
#         password = data.get("password")

#         if not email or not password:
#             raise HTTPException(status_code=400, detail="Email and password required")

#         payload_json = json.dumps({
#             "email": email,
#             "password": password
#         })

#         conn = get_db_connection()
#         cursor = conn.cursor()

#         cursor.execute("SET @result_json = NULL;")
#         cursor.execute("CALL manage_user_signin(%s, @result_json);", (payload_json,))
#         cursor.execute("SELECT @result_json AS result_json;")

#         result = cursor.fetchone()
#         conn.commit()

#         if not result or not result["result_json"]:
#             raise HTTPException(status_code=400, detail="No response from database")

#         result_json = json.loads(result["result_json"])

#         if result_json.get("status") != "success":
#             raise HTTPException(status_code=400, detail=result_json.get("message"))

#         stored_hash = result_json.get("password_hash")
#         print("stored hash pw:",stored_hash)
#         sha = hashlib.sha256(password.encode('utf-8')).hexdigest()
#         print("sha pw:",sha)
#         if not pwd_ctx.verify(sha, stored_hash):
#             raise HTTPException(status_code=401, detail="Invalid username or password")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         cursor.close()
#         conn.close()


#well working signin

@app.post("/signin")
async def signin(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    payload_json = json.dumps({
        "email": email
    })

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SET @result_json = NULL;")
    cursor.execute("CALL manage_user_signin2(%s, @result_json);", (payload_json,))
    cursor.execute("SELECT @result_json AS result_json;")

    result = cursor.fetchone()
    result_json = json.loads(result["result_json"])

    if result_json["status"] != 1:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    stored_hash = result_json.get("password_hash")

  
    if not pwd_ctx.verify(password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # token = create_access_token({
    #     "user_id": result_json["id"],
    #     "email": result_json["email"]
    # })
    payload = {
    
       "user_id": result_json["id"],
         "email": result_json["email"]
     
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    
    userid = result_json["id"]

    return {
        "status":1,
        "message": "Login successful",
        "token": token,
        "user": {
            "id": result_json["id"],
            "email": result_json["email"],
            "username": result_json["username"]
        }
    }


# {
#     "email": "rake67891011@gmail.com",
#     "password": "123456"
# }



















    
@app.get("/record")
def test_get_record(user = Depends(verify_token)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Hardcoded payload
        # payload = {"userid": 1}
        user_id = user.get("user_id")
        payload =  user_id  
        payload_str = json.dumps(payload)

        # Exactly like in MySQL CLI
        cursor.execute("SET @payload = %s", (payload_str,))
        cursor.execute("CALL getTransactionsRecordForTable(@payload, @result)")
        cursor.execute("SELECT @result AS result_json")

        out_result = cursor.fetchone()

        cursor.close()
        conn.close()

        if out_result and out_result["result_json"]:
            return json.loads(out_result["result_json"])
        else:
            return {"status": "error", "message": "No result returned from procedure"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/addbudget")
def add_or_edit_budget(payload: Dict[str, Any],user = Depends(verify_token)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Hardcoded payload
       # payload = {"userid": 1}  
        user_id = user.get("user_id")
        payload["userid"] = user_id
        payload_str = json.dumps(payload)

        # Exactly like in MySQL CLI
        cursor.execute("SET @payload = %s", (payload_str,))
        cursor.execute("CALL budget_management2(@payload, @result_json)")
        cursor.execute("SELECT @result_json AS result_json")

        out_result = cursor.fetchone()

        cursor.close()
        conn.close()

        if out_result and out_result["result_json"]:
            return json.loads(out_result["result_json"])
        else:
            return {"status": "error", "message": "No result returned from procedure"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/budgetamount")
def get_users(user = Depends(verify_token)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        user_id = user.get("user_id")
        sql_query = "SELECT amount,userid from budget where userid = %s"
        cursor.execute(sql_query, (user_id,))
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return {"budgetresult": rows}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/")
def home_route(user = Depends(verify_token)):
    return "server in live..."


# dynamic payload
# @app.post("/get-record")
# def get_record(payload: Dict[str, Any]):
#     try:
#         conn = get_db_connection()
#         cursor = conn.cursor()

#         payload_str = json.dumps(payload)

#         # Pass payload from frontend
#         cursor.execute("SET @payload = %s", (payload_str,))
#         cursor.execute("CALL getRecord(@payload, @result)")
#         cursor.execute("SELECT @result AS result_json")

#         out_result = cursor.fetchone()

#         cursor.close()
#         conn.close()

#         if out_result and out_result["result_json"]:
#             return json.loads(out_result["result_json"])
#         else:
#             return {"status": "error", "message": "No result returned"}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

