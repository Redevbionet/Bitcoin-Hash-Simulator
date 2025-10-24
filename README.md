https://bitcoin-hash-simulator-zqxa.vercel.app/



<img width="450" height="450" alt="image" src="https://github.com/user-attachments/assets/717351a4-229e-4e07-af71-3a9e812effdc" />
<img width="450" height="450" alt="image" src="https://github.com/user-attachments/assets/8ae4b7b7-9270-4004-bb47-139d2c9dda80" />

## Bitcoin Hash Simulator
ตัวอย่างโค้ด Python ที่จำลองกระบวนการแฮชสำหรับ Bitcoin's Proof-of-Work เวอร์ชันที่เรียบง่าย
วิธีการทำงาน (แบบง่าย):
ข้อมูลบล็อค:เราจะรวมข้อมูลบางอย่าง (เช่น รายละเอียดธุรกรรม) เข้ากับตัวเลขพิเศษที่เรียกว่า "nonce"
แฮช:เราจะใช้ฟังก์ชันแฮชเข้ารหัส SHA-256 เช่นเดียวกับ Bitcoin ฟังก์ชันนี้รับอินพุตและสร้างเอาต์พุตที่มีขนาดคงที่และไม่ซ้ำกัน (แฮช)
เป้าหมายความยาก:ใน Bitcoin จริง นักขุดจะพยายามหาค่าแฮชที่เริ่มต้นด้วยเลขศูนย์จำนวนหนึ่ง นี่คือ "ความยาก" เราจะจำลองสถานการณ์นี้โดยการกำหนดจำนวนเลขศูนย์นำหน้าเป้าหมาย
การขุด:"นักขุด" (โค้ดของเรา) จะลอง nonce ที่แตกต่างกันซ้ำๆ โดยแฮชข้อมูลทุกครั้ง จนกว่าจะพบ nonce ที่สร้างแฮชที่ตรงตามเป้าหมายความยาก
นี่คือโค้ด:

         import hashlib
         import time

          def bitcoin_hash_simulator(block_data, difficulty_zeros):
         nonce = 0
       target_prefix = '0' * difficulty_zeros
       print(f"Starting mining for data: '{block_data}' with difficulty: {difficulty_zeros} leading zeros...")

    start_time = time.time()
    while True:
        # Combine block data and nonce
        text_to_hash = block_data + str(nonce)

        # Calculate SHA-256 hash
        sha256_hash = hashlib.sha256(text_to_hash.encode('utf-8')).hexdigest()

        # Check if the hash meets the difficulty target
        if sha256_hash.startswith(target_prefix):
            end_time = time.time()
            elapsed_time = end_time - start_time
            print("\n--- Block Mined! ---")
            print(f"Block Data: {block_data}")
            print(f"Nonce found: {nonce}")
            print(f"Hash: {sha256_hash}")
            print(f"Time taken: {elapsed_time:.4f} seconds")
            print(f"Hash starts with '{target_prefix}' (Difficulty Met!)")
            break
        
        nonce += 1
        # Optional: Print progress every X nonces (can be slow for high difficulty)
        # if nonce % 100000 == 0:
        #     print(f"Attempting nonce: {nonce}, Current Hash: {sha256_hash}")
            

# --- Simulation Parameters ---
# You can change these values to see how the difficulty affects mining time
    block_data_example = "My first transaction data!"
    desired_difficulty = 5  # Number of leading zeros required (e.g., 4, 5, 6)

# Run the simulator
      bitcoin_hash_simulator(block_data_example, desired_difficulty)
   
            

# --- Simulation Parameters ---
# You can change these values to see how the difficulty affects mining time


## ในการรันโค้ดนี้:
บันทึกเป็นไฟล์ Python (เช่นแฮช_ซิม.py-
เปิดเทอร์มินัลหรือพรอมต์คำสั่ง
ไปที่ไดเร็กทอรีที่คุณบันทึกไฟล์
รันคำสั่ง:python hash_sim.py
คำอธิบายความยาก:
ระดับความยากที่ต้องการ = 1หรือ2-คุณจะพบแฮชได้เกือบจะทันที
ระดับความยากที่ต้องการ = 4หรือ5-อาจใช้เวลาสองสามวินาทีหรือไม่กี่นาที ขึ้นอยู่กับความเร็วของคอมพิวเตอร์ของคุณ
ระดับความยากที่ต้องการ = 6หรือสูงกว่า:อาจต้องใช้เวลานานมาก (นาที ชั่วโมง หรือแม้กระทั่งวัน สำหรับตัวเลขที่สูงกว่าอย่างเห็นได้ชัด!) ซึ่งแสดงให้เห็นถึงความพยายามในการคำนวณที่จำเป็นสำหรับการขุด Bitcoin จริง
โปรแกรมจำลองนี้ช่วยให้คุณเข้าใจพื้นฐานว่า Proof-of-Work ใช้การแฮชและ "nonce" อย่างไรเพื่อให้บรรลุเป้าหมายความยาก
นี่คือภาพที่แสดงแนวคิดของการแฮชและเป้าหมายความยากในแบบจำลองที่เรียบง่าย

# Run the simulator
bitcoin_hash_simulator(block_data_example, desired_difficulty)
