#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pentesting Cybersecurité Malagasy ara-dalana
Tool developed for educational and legal purposes only.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import os
import sys

class HackerToolApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Pentesting Cybersecurité Malagasy ara-dalana")
        self.root.geometry("1000x700")
        self.root.configure(bg="#0d0d0d")

        # Fonts
        self.title_font = ("Courier New", 24, "bold")
        self.text_font = ("Courier New", 12)
        self.btn_font = ("Courier New", 10, "bold")

        # --- Header / Sary Madagascar ---
        self.header_frame = tk.Frame(root, bg="#0d0d0d")
        self.header_frame.pack(pady=10)

        # Label title
        self.title_label = tk.Label(
            self.header_frame, 
            text="PENTESTING CYBERSECURITÉ MALAGASY ARA-DALANA", 
            fg="#00ff00", 
            bg="#0d0d0d", 
            font=self.title_font
        )
        self.title_label.pack()

        self.subtitle_label = tk.Label(
            self.header_frame, 
            text="Outils légaux pour la sécurité informatique à Madagascar", 
            fg="#00cc00", 
            bg="#0d0d0d", 
            font=("Courier New", 10)
        )
        self.subtitle_label.pack()

        # Sary Madagascar (Simulation graphique si pas d'image, ou chargement fichier)
        # Nous allons dessiner une carte stylisée ou mettre un placeholder pour l'image
        self.canvas_map = tk.Canvas(root, width=300, height=400, bg="#0d0d0d", highlightthickness=0)
        self.canvas_map.pack(pady=5)
        
        # Dessin simplifié de Madagascar (Vert, Rouge, Blanc)
        # Bande blanche verticale
        self.canvas_map.create_rectangle(50, 50, 150, 350, fill="white", outline="")
        # Bande rouge horizontale haut
        self.canvas_map.create_rectangle(150, 50, 250, 200, fill="#FC3D32", outline="")
        # Bande verte horizontale bas
        self.canvas_map.create_rectangle(150, 200, 250, 350, fill="#007E3A", outline="")
        
        self.canvas_map.create_text(150, 380, text="MADAGASIKARA", fill="#00ff00", font=("Courier New", 14, "bold"))

        # --- Zone Principale des Outils ---
        self.main_frame = tk.Frame(root, bg="#1a1a1a")
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)

        # Scrollbar
        scrollbar = ttk.Scrollbar(self.main_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.tools_listbox = tk.Listbox(
            self.main_frame, 
            bg="#000000", 
            fg="#00ff00", 
            font=self.text_font,
            selectbackground="#003300",
            selectforeground="#ffffff",
            yscrollcommand=scrollbar.set,
            height=15
        )
        self.tools_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.tools_listbox.yview)

        # Remplir la liste des outils
        self.outils = [
            "Nmap - Analyse réseau",
            "Metasploit Framework - Test d'intrusion",
            "Wireshark - Analyse de paquets",
            "Burp Suite - Sécurité Web",
            "John the Ripper - Cracking de mots de passe",
            "Aircrack-ng - Sécurité WiFi",
            "SQLMap - Injection SQL",
            "Hydra - Attaque par force brute",
            "Maltego - OSINT & Reconnaissance",
            "Netcat - Couteau suisse réseau",
            "Gobuster - Directory Bruteforcing",
            "Nikto - Scan de vulnérabilités Web"
        ]

        for outil in self.outils:
            self.tools_listbox.insert(tk.END, f"> {outil}")

        # --- Boutons d'action ---
        self.btn_frame = tk.Frame(root, bg="#0d0d0d")
        self.btn_frame.pack(pady=20)

        self.run_btn = tk.Button(
            self.btn_frame,
            text="LANCER L'OUTIL SÉLECTIONNÉ",
            command=self.run_selected_tool,
            bg="#003300",
            fg="#00ff00",
            font=self.btn_font,
            activebackground="#005500",
            activeforeground="#ffffff",
            relief=tk.FLAT,
            padx=20,
            pady=10
        )
        self.run_btn.pack(side=tk.LEFT, padx=10)

        self.info_btn = tk.Button(
            self.btn_frame,
            text="INFO LÉGALE",
            command=self.show_legal_info,
            bg="#330000",
            fg="#ff3333",
            font=self.btn_font,
            activebackground="#550000",
            activeforeground="#ffffff",
            relief=tk.FLAT,
            padx=20,
            pady=10
        )
        self.info_btn.pack(side=tk.LEFT, padx=10)

        self.quit_btn = tk.Button(
            self.btn_frame,
            text="QUITTER",
            command=root.quit,
            bg="#333333",
            fg="#ffffff",
            font=self.btn_font,
            activebackground="#555555",
            relief=tk.FLAT,
            padx=20,
            pady=10
        )
        self.quit_btn.pack(side=tk.LEFT, padx=10)

        # Status bar
        self.status_bar = tk.Label(root, text="Prêt. Sélectionnez un outil.", anchor=tk.W, bg="#000000", fg="#008800", font=("Courier New", 9))
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)

    def run_selected_tool(self):
        selection = self.tools_listbox.curselection()
        if not selection:
            messagebox.showwarning("Attention", "Veuillez sélectionner un outil dans la liste.")
            return

        selected_text = self.tools_listbox.get(selection[0])
        tool_name = selected_text.split(" - ")[0].replace("> ", "")
        
        self.status_bar.config(text=f"Tentative de lancement de : {tool_name}...")
        
        # Simulation de lancement (dans un vrai cas, cela lancerait le binaire)
        # Ici on vérifie si la commande existe
        try:
            # On lance dans un terminal séparé si possible, ou on affiche un message
            # Pour l'exemple, on utilise x-terminal-emulator ou gnome-terminal
            terminal_cmds = ["gnome-terminal", "xterm", "konsole", "xfce4-terminal"]
            launched = False
            
            for term in terminal_cmds:
                if os.system(f"which {term} > /dev/null 2>&1") == 0:
                    # Commande pour ouvrir l'outil
                    cmd = f"{term} -e '{tool_name}' &"
                    # Note: Certains outils nécessitent des arguments, ici on lance juste le nom
                    # Si l'outil n'est pas installé, le terminal affichera une erreur
                    subprocess.Popen([term, "-e", "bash", "-c", f"{tool_name}; exec bash"])
                    launched = True
                    break
            
            if not launched:
                messagebox.showinfo("Info", f"L'outil {tool_name} devrait être lancé. Assurez-vous qu'il est installé sur votre système (ex: apt install {tool_name.lower()}).")
            
        except Exception as e:
            messagebox.showerror("Erreur", f"Impossible de lancer l'outil: {str(e)}")

    def show_legal_info(self):
        msg = """AVERTISSEMENT LÉGAL :

Ce logiciel est conçu UNIQUEMENT à des fins éducatives et pour tester la sécurité de vos PROPRES systèmes ou de systèmes pour lesquels vous avez une AUTORISATION ÉCRITE explicite.

L'utilisation de ces outils pour pirater des systèmes sans autorisation est ILLÉGALE à Madagascar (Loi sur la cybercriminalité) et dans le monde entier.

Les développeurs ne sont pas responsables des mauvais usages de cet outil.

Faites du hacking éthique (White Hat).
"""
        messagebox.showwarning("ATTENTION LÉGALE", msg)

if __name__ == "__main__":
    root = tk.Tk()
    app = HackerToolApp(root)
    root.mainloop()
