import sys
import importlib.util
from pathlib import Path

server_path = Path(__file__).resolve().parent / "server"
if str(server_path) not in sys.path:
    sys.path.insert(0, str(server_path))

spec = importlib.util.spec_from_file_location("server_main", server_path / "main.py")
server_main = importlib.util.module_from_spec(spec)
sys.modules["server_main"] = server_main
spec.loader.exec_module(server_main)

app = server_main.app
