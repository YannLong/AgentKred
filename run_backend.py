import os
import subprocess
import time
import sys

PORT = 11311

def kill_port(port):
    """Find and kill process using the port."""
    try:
        # Find PID (lsof is standard on Mac/Linux)
        result = subprocess.check_output(f"lsof -t -i:{port}", shell=True)
        pids = result.decode().strip().split('\n')
        for pid in pids:
            if pid:
                print(f"🧹 Killing old process on port {port} (PID: {pid})...")
                os.system(f"kill -9 {pid}")
    except subprocess.CalledProcessError:
        pass # No process found

def run():
    # 1. Clean up
    kill_port(PORT)
    time.sleep(1) # Wait for OS to release port
    
    # 2. Start
    print(f"🚀 Starting AgentKred Backend on port {PORT} using uv...")
    cmd = ["/Users/ymini/.local/bin/uv", "run", "main.py"]
    
    # Replace current process with uvicorn
    # os.execv(cmd[0], cmd) would require absolute path resolution for uv
    # We use subprocess to keep control if needed, but here we just run it.
    subprocess.run(cmd)

if __name__ == "__main__":
    run()
