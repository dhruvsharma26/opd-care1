import cv2
import asyncio
from fastapi import FastAPI, WebSocket
from ultralytics import YOLO
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Globals
model = None
cap = None
unique_ids = set()
current_count = 0
previous_ids = set()
current_ids = set()
footfall_increment = 0

# # 🔁 Detection loop
# async def detection_loop():
#     global current_count, cap, model, previous_ids, current_ids,footfall_increment

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             continue

#         results = model.track(frame, imgsz=320,persist=True, tracker="bytetrack.yaml")

#         boxes = results[0].boxes
#         if boxes.id is not None:
#             ids = boxes.id.cpu().numpy()
#             for i in ids:
#                 # unique_ids.add(int(i))
#                 current_ids = set(int(i) for i in ids)

#          # 🔥 NEW LOGIC: detect new entries
#         new_ids = current_ids - previous_ids
#         footfall_increment = len(new_ids)

#         previous_ids = current_ids

#         # current_count = len(unique_ids)
#         current_count += len(current_ids)

#         await asyncio.sleep(0.03)


async def detection_loop():
    global current_count, cap, model, previous_ids, current_ids, footfall_increment, unique_ids

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        results = model.track(frame, imgsz=320, persist=True, tracker="bytetrack.yaml")

        boxes = results[0].boxes

        if boxes.id is not None:
            ids = boxes.id.cpu().numpy()
            current_ids = set(int(i) for i in ids)
        else:
            current_ids = set()

        # ✅ new people entering
        new_ids = current_ids - unique_ids
        footfall_increment = len(new_ids)

        # ✅ store all seen people
        unique_ids.update(new_ids)

        # ✅ current people in frame
        current_count = len(current_ids)

        await asyncio.sleep(0.03)

# ✅ Lifespan (NEW correct method)
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, cap

    print("🚀 Starting app...")

    model = YOLO("yolov8n.pt")   # ⚠️ use valid model
    cap = cv2.VideoCapture(0)

    # start background task
    asyncio.create_task(detection_loop())

    yield

    print("🛑 Shutting down...")
    cap.release()

# ✅ Attach lifespan HERE
app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("WebSocket Connected")
    await websocket.accept()

    while True:
        await websocket.send_json({"count": current_count,
        "increment": footfall_increment})
        await asyncio.sleep(0.5)