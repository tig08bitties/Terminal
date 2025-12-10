#!/bin/bash
echo "🏗️ Google Cloud Shell X11 Setup"
sudo apt update && sudo apt install -y x11-apps xauth
echo "✅ X11 utilities installed"
echo "Test with: xeyes"
