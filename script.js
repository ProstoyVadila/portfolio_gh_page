class PortfolioSite {
  constructor() {
    this.isTerminalMode = true;
    this.terminal = new TerminalPortfolio();
    this.mobileNav = new MobileNavigation();
    this.initEventListeners();
  }

  initEventListeners() {
    // Close button functionality
    document.getElementById("closeBtn").addEventListener("click", () => {
      this.switchToWebsite();
    });

    // Terminal toggle button
    document.getElementById("terminalToggle").addEventListener("click", () => {
      this.switchToTerminal();
    });

    // Setup smooth scrolling for all navigation links
    this.setupNavigationScrolling();
  }

  setupNavigationScrolling() {
    // Remove any existing listeners first
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      // Clone node to remove all existing event listeners
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
    });

    // Add new listeners
    setTimeout(() => {
      const freshNavLinks = document.querySelectorAll(".nav-link");

      freshNavLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const href = link.getAttribute("href");
          if (!href || !href.startsWith("#")) return;

          const targetId = href.substring(1);

          // Try to find the target element
          setTimeout(() => {
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
              // Close mobile menu if open
              if (this.mobileNav && this.mobileNav.isMenuOpen) {
                this.mobileNav.closeMenu();

                // Wait for menu animation to complete
                setTimeout(() => {
                  // Calculate offset for sticky navbar
                  const navbarHeight =
                    document.querySelector(".navbar").offsetHeight || 0;
                  const elementPosition =
                    targetElement.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - navbarHeight - 20;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }, 350);
              } else {
                // Desktop or menu already closed
                const navbarHeight =
                  document.querySelector(".navbar").offsetHeight || 0;
                const elementPosition =
                  targetElement.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });
              }
            } else {
              console.warn(`Target element not found: ${targetId}`);
            }
          }, 50);
        });
      });
    }, 100);
  }

  switchToWebsite() {
    console.log("Switching to website mode...");

    const fadeTransition = document.getElementById("fadeTransition");
    const terminal = document.getElementById("terminal");
    const website = document.getElementById("website");

    if (!fadeTransition || !terminal || !website) {
      console.error("Missing required elements for mode switch");
      return;
    }

    fadeTransition.classList.add("active");

    setTimeout(() => {
      document.body.classList.add("website-mode");
      terminal.style.display = "none";
      website.style.display = "block";
      website.classList.add("active");
      this.isTerminalMode = false;

      // Force scroll to top
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      // Ensure mobile nav is properly initialized
      if (!this.mobileNav.hamburger) {
        this.mobileNav.setupElements();
      }

      // Re-setup navigation after mode switch with longer delay
      setTimeout(() => {
        this.setupNavigationScrolling();
      }, 500);

      console.log("Website mode activated");

      setTimeout(() => {
        fadeTransition.classList.remove("active");
      }, 100);
    }, 300);
  }

  switchToTerminal() {
    console.log("Switching to terminal mode...");

    const fadeTransition = document.getElementById("fadeTransition");
    const terminal = document.getElementById("terminal");
    const website = document.getElementById("website");

    if (!fadeTransition || !terminal || !website) {
      console.error("Missing required elements for mode switch");
      return;
    }

    fadeTransition.classList.add("active");

    setTimeout(() => {
      document.body.classList.remove("website-mode");
      website.style.display = "none";
      terminal.style.display = "block";
      terminal.classList.remove("hidden");
      website.classList.remove("active");
      this.isTerminalMode = true;

      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      if (this.terminal && this.terminal.commandInput) {
        this.terminal.commandInput.focus();
      }

      console.log("Terminal mode activated");

      setTimeout(() => {
        fadeTransition.classList.remove("active");
      }, 100);
    }, 300);
  }
}

class MobileNavigation {
  constructor() {
    this.hamburger = null;
    this.navMenu = null;
    this.navBackdrop = null;
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  setupElements() {
    this.createHamburgerButton();
    this.hamburger = document.querySelector(".hamburger");
    this.navMenu = document.querySelector(".nav-menu");
    this.createBackdrop();

    if (this.hamburger && this.navMenu) {
      this.setupEventListeners();
    }
  }

  createHamburgerButton() {
    const navContainer = document.querySelector(".nav-container");
    if (!navContainer || document.querySelector(".hamburger")) return;

    const hamburger = document.createElement("button");
    hamburger.className = "hamburger";
    hamburger.setAttribute("aria-label", "Toggle navigation menu");
    hamburger.setAttribute("aria-expanded", "false");

    for (let i = 0; i < 3; i++) {
      const span = document.createElement("span");
      hamburger.appendChild(span);
    }

    navContainer.appendChild(hamburger);
  }

  createBackdrop() {
    if (document.querySelector(".nav-backdrop")) return;

    const backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";

    const website = document.querySelector(".website");
    const navbar = document.querySelector(".navbar");
    if (website && navbar) {
      website.insertBefore(backdrop, navbar);
    } else {
      document.body.insertBefore(backdrop, document.body.firstChild);
    }
    this.navBackdrop = backdrop;
  }

  setupEventListeners() {
    // Hamburger click
    this.hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu();
    });

    // Backdrop click
    if (this.navBackdrop) {
      this.navBackdrop.addEventListener("click", () => {
        this.closeMenu();
      });
    }

    // Close menu on window resize if open
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Ensure links work on mobile
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-link")) {
        e.preventDefault();
        const href = e.target.getAttribute("href");
        if (href && href.startsWith("#")) {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement && this.isMenuOpen) {
            this.closeMenu();
            setTimeout(() => {
              const navbarHeight =
                document.querySelector(".navbar").offsetHeight || 0;
              const elementPosition = targetElement.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.pageYOffset - navbarHeight - 20;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }, 350);
          }
        }
      }
    });
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isMenuOpen = true;
    this.hamburger.classList.add("active");
    this.navMenu.classList.add("active");
    if (this.navBackdrop) {
      this.navBackdrop.classList.add("active");
    }
    document.body.classList.add("menu-open");
    this.hamburger.setAttribute("aria-expanded", "true");
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.hamburger.classList.remove("active");
    this.navMenu.classList.remove("active");
    if (this.navBackdrop) {
      this.navBackdrop.classList.remove("active");
    }
    document.body.classList.remove("menu-open");
    this.hamburger.setAttribute("aria-expanded", "false");
  }
}

class TerminalPortfolio {
  constructor() {
    this.currentPath = "/home/user";
    this.commandHistory = [];
    this.historyIndex = -1;
    this.fileSystem = this.initFileSystem();
    this.commandInput = document.getElementById("commandInput");
    this.terminal = document.getElementById("terminalBody");

    this.initEventListeners();
    if (this.commandInput) {
      this.commandInput.focus();
    }
  }

  initFileSystem() {
    return {
      "/home/user": {
        type: "directory",
        contents: {
          "about.txt": {
            type: "file",
            downloadable: true,
            mimeType: "text/plain",
            realFile: "about.txt",
            content: null,
          },
          "README.md": {
            type: "file",
            downloadable: true,
            mimeType: "text/plain",
            realFile: "README.md",
            content: null,
          },
          "cv.pdf": {
            type: "file",
            downloadable: true,
            mimeType: "application/pdf",
            realFile: "cv.pdf",
            content: `📄 CV/Resume - Vadim Gorbachev

This is a PDF file. Use 'scp cv.pdf' to download the full resume.

Quick Overview:
==============
Senior Software Engineer specializing in Python and Go
Currently at Salmon (Filipino Bank) developing ML risk models
Previous experience at Tetrika School and Sberbank
Expert in microservices, WebSocket systems, and ETL pipelines

Contact: vadim.gorbachev.dev@gmail.com
Location: Puerto Princesa, Philippines

[Download full PDF: cv.pdf]`,
          },
          "contact.txt": {
            type: "file",
            downloadable: true,
            mimeType: "text/plain",
            realFile: "contact.txt",
            content: null,
          },
          projects: {
            type: "directory",
            contents: {
              "ml-risk-system": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# ML Risk Assessment System (Salmon Project)

## Overview
Developed and deployed ML risk models using AWS Lambda for POS (Point of Sale) product at Salmon, a Filipino fintech company.

## Key Components
- **Feature Store**: Centralized feature management for ML models
- **Models API Service**: RESTful API for risk score calculation  
- **Decision-Making System**: Automated loan approval/rejection logic

## Technical Stack
- **Languages**: Python
- **Cloud**: AWS Lambda, AWS Rekognition
- **Databases**: PostgreSQL
- **Streaming**: Apache Kafka
- **Infrastructure**: Terraform, Kubernetes

## Achievements
🎯 <100ms average response time for risk scoring
🎯 99.9% uptime for critical risk assessment services
🎯 Successfully contributed to launching new credit product
🎯 Improved inter-team collaboration through clean API contracts

## Business Impact
- Automated manual risk assessment processes
- Improved accuracy of credit decisions
- Built audit trails for regulatory compliance`,
                  },
                },
              },
              "websocket-chat": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Real-Time Chat System (Tetrika School)

## Overview
Redesigned WebSocket microservice for real-time lesson communication, supporting thousands of concurrent students and teachers.

## The Challenge
- Connection drops during high load
- Duplicated messages in Python Tornado service
- Memory consumption issues
- Limited horizontal scaling capabilities

## Solution
Migrated from Python Tornado to **Go with Centrifuge framework**

## Architecture
- **Backend**: Go with Centrifuge framework
- **Message Broker**: Redis Pub/Sub for horizontal scaling
- **Load Balancer**: nginx with sticky sessions
- **Deployment**: Kubernetes cluster with auto-scaling

## Key Results
🚀 Reduced resource consumption by 60%
🚀 Eliminated critical bugs like message duplication
🚀 Horizontal scaling with Redis clustering
🚀 99.9% uptime during peak usage periods

## Frontend Integration
Also contributed to NextJS WebSocket component rewrite:
- Improved connection state management
- Better error handling and user feedback`,
                  },
                },
              },
              "etl-pipeline": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# ETL Data Pipeline (Sberbank Project)

## Overview
Developed ETL pipeline for real estate and vehicle price evaluation using classified ads data from Russia and neighboring countries.

## Project Scope
- **Data Sources**: Multiple platforms (Avito, Auto.ru, etc.)
- **Geographic Coverage**: Russia and CIS countries
- **Data Volume**: Millions of listings processed daily
- **Purpose**: Price evaluation models for loan risk assessment

## My Contributions

### Parser Development
- Implemented new parsers for real estate and vehicle platforms
- Built anti-detection mechanisms and proxy rotation systems
- Created robust data extraction logic handling various site structures

### Microservice Enhancements  
- Enhanced proxy management microservice (Flask)
- Improved ORM service using SQLAlchemy
- Implemented error handling and retry mechanisms

### Data Processing
- Data cleaning and normalization using Pandas
- Created analytics queries for data quality assessment
- Developed monitoring dashboards for data flow tracking

## Technology Stack
- **Languages**: Python
- **Frameworks**: Scrapy (customized), Flask, SQLAlchemy  
- **Databases**: PostgreSQL, Memcached
- **Message Queue**: RabbitMQ
- **Monitoring**: Kibana, Prometheus
- **CI/CD**: GitLab CI, Jenkins

## Business Impact
- Provided accurate market data for loan decisions
- Replaced manual price research with automated system
- Eliminated need for expensive third-party data providers`,
                  },
                },
              },
              parsera: {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Parsera - Web Scraping Platform

## Overview
Pet project of a scalable 24/7 crawler platform based on microservices architecture. Started to deepen knowledge in system design and explore Go and Rust frameworks.

## Architecture Design
- **Microservices**: Separate services for different responsibilities
- **Multi-language**: Services written in Python, Go, and Rust
- **Scalability**: Designed for 24/7 operation
- **Flexibility**: Easy addition of new parsers through API/web interface

## System Components
- **Parser Management Service** (Go): Handles parser configuration
- **Data Processing Service** (Rust): High-performance data cleaning
- **Web Interface** (Python): User-friendly parser management UI
- **Queue Manager** (Go): Task distribution and monitoring
- **Storage Service** (Rust): Optimized data persistence layer

## Technical Stack
- **Languages**: Python, Go, Rust
- **Databases**: PostgreSQL for data storage
- **Message Queue**: RabbitMQ for task distribution
- **Cache**: Redis for performance optimization
- **Deployment**: Docker containers

## Learning Outcomes
- **System Design**: Understanding of distributed systems principles
- **Go Development**: Proficiency in Go for backend services
- **Rust Programming**: Experience with Rust for performance-critical components
- **DevOps**: Docker containerization and service orchestration

## Current Status
- Active development since August 2023
- Core services implemented and tested
- Docker-based deployment pipeline

Source: Personal GitHub repository`,
                  },
                },
              },
              goproj: {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Goproj - Go Project Template CLI

## Overview
A smart CLI tool for Go project initialization with customizable templates and configurations.

## Features
- **Smart Templates**: Automatically generates project structure
- **Customizable**: Configure templates through arguments or config file
- **Comprehensive Setup**: Includes all essential project files
- **Developer Tools**: Integrates with Git and VS Code

## Generated Project Structure
\`\`\`
project-name/
├── main.go
├── go.mod
├── Dockerfile (with latest Alpine version check)
├── Makefile
├── .gitignore
├── LICENSE
├── README.md
└── cmd/main/main.go
\`\`\`

## Key Features
🚀 **Alpine Version Check**: Automatically fetches latest Alpine Linux version
🚀 **Interactive Mode**: Step-by-step project configuration
🚀 **Config File Support**: Save preferences for future projects
🚀 **Git Integration**: Automatic repository initialization
🚀 **VS Code Setup**: Workspace configuration for optimal development

## Technical Implementation
- **Language**: Go
- **CLI Framework**: Cobra for command-line interface
- **Templates**: Go templates for file generation
- **HTTP Client**: For fetching latest Alpine versions

## Installation
\`\`\`bash
go install github.com/ProstoyVadila/goproj@latest
\`\`\`

## Benefits
- Reduces project setup time from minutes to seconds
- Ensures consistent project structure across teams
- Includes Go community best practices

Source: github.com/ProstoyVadila/goproj`,
                  },
                },
              },
            },
          },
          skills: {
            type: "directory",
            contents: {
              "languages.txt": {
                type: "file",
                downloadable: true,
                mimeType: "text/plain",
                realFile: "languages.txt",
                content: null,
              },
              "databases.txt": {
                type: "file",
                downloadable: true,
                mimeType: "text/plain",
                realFile: "databases.txt",
                content: null,
              },
              "cloud.txt": {
                type: "file",
                downloadable: true,
                mimeType: "text/plain",
                realFile: "cloud.txt",
                content: null,
              },
            },
          },
        },
      },
    };
  }

  async loadFileContent(file) {
    if (file.content !== null) {
      return file.content;
    }

    if (file.realFile) {
      try {
        const response = await fetch(`./files/${file.realFile}`);
        if (response.ok) {
          file.content = await response.text();
          return file.content;
        } else {
          throw new Error(`Failed to load ${file.realFile}`);
        }
      } catch (error) {
        console.error(`Error loading ./files/${file.realFile}:`, error);
        file.content = `Error loading file: ${file.realFile}\nSorry :(`;
        return file.content;
      }
    }

    return "File content not available";
  }

  initEventListeners() {
    if (!this.commandInput) {
      console.error("Command input not found");
      return;
    }

    this.commandInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.executeCommand();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.autoComplete();
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".website") && this.commandInput) {
        this.commandInput.focus();
      }
    });
  }

  executeCommand() {
    const command = this.commandInput.value.trim();
    if (command) {
      this.addToHistory(command);
      this.commandHistory.push(command);
      this.historyIndex = this.commandHistory.length;
    }

    this.processCommand(command);
    this.commandInput.value = "";
    this.scrollToBottom();
  }

  addToHistory(command) {
    const inputLine = document.createElement("div");
    inputLine.className = "output";
    inputLine.innerHTML = `<span class="prompt">user@portfolio:${this.currentPath}$</span> ${command}`;
    if (this.terminal) {
      this.terminal.insertBefore(inputLine, this.terminal.lastElementChild);
    }
  }

  processCommand(command) {
    if (command.includes("|")) {
      this.processPipeCommand(command);
      return;
    }

    const [cmd, ...args] = command.split(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        this.showHelp();
        break;
      case "ls":
        this.listFiles(args[0]);
        break;
      case "cd":
        this.changeDirectory(args[0]);
        break;
      case "cat":
        this.readFile(args[0]);
        break;
      case "pwd":
        this.printWorkingDirectory();
        break;
      case "clear":
        this.clearTerminal();
        break;
      case "whoami":
        this.whoami();
        break;
      case "date":
        this.showDate();
        break;
      case "echo":
        this.echo(args.join(" "));
        break;
      case "demo":
        this.runDemo();
        break;
      case "grep":
        this.grep(args);
        break;
      case "cowsay":
        this.cowsay(args.join(" "));
        break;
      case "sudo":
        this.sudo(args);
        break;
      case "scp":
        this.downloadFile(args);
        break;
      case "website":
        this.switchToWebsite();
        break;
      case "exit":
        this.switchToWebsite();
        break;
      case "":
        break;
      default:
        this.commandNotFound(cmd);
        break;
    }
  }

  showHelp() {
    const helpText = `<div class="output">
<span class="highlight">Available Commands:</span><br />
<br />
<span class="success">Navigation:</span><br />
• ls [path]     - List files and directories<br />
• cd [path]     - Change directory<br />
• pwd           - Show current directory<br />
• cat [file]    - Display file content<br />
<br />
<span class="success">System:</span><br />
• help          - Show this help message<br />
• clear         - Clear the terminal<br />
• whoami        - Display user information<br />
• date          - Show current date and time<br />
• echo [text]   - Display text<br />
<br />
<span class="success">Search & Text:</span><br />
• grep [pattern] [file] - Search for patterns in files<br />
• cowsay [text] - ASCII cow says your text<br />
• scp [file]    - Download file to your computer<br />
<br />
<span class="success">Portfolio:</span><br />
• demo          - Run interactive project demo<br />
• website       - Switch to website view<br />
• exit          - Close the terminal window<br />
<br />
<span class="success">Pipes:</span><br />
• cat file | grep pattern - Search within file content<br />
• ls | grep pattern       - Filter directory listings<br />
<br />
<span class="highlight">Tips:</span><br />
• Use Tab for auto-completion<br />
• Use ↑/↓ arrow keys for command history<br />
• Try: cat about.txt | grep backend<br />
• Use 'website' or 'exit' command or click the red button to switch views<br />
</div>`;
    this.addOutput(helpText);
  }

  switchToWebsite() {
    this.addOutput(`<span class="success">Switching to website view...</span>`);
    setTimeout(() => {
      if (window.portfolioSite) {
        window.portfolioSite.switchToWebsite();
      }
    }, 500);
  }

  addOutput(html) {
    if (!this.terminal) {
      console.error("Terminal element not found");
      return;
    }
    const output = document.createElement("div");
    output.innerHTML = html;
    this.terminal.insertBefore(output, this.terminal.lastElementChild);
  }

  listFiles(path) {
    const targetPath = path ? this.resolvePath(path) : this.currentPath;
    const dir = this.getDirectory(targetPath);

    if (!dir) {
      this.addOutput(
        `<span class="error">ls: cannot access '${
          path || this.currentPath
        }': No such file or directory</span>`
      );
      return;
    }

    let output = '<div class="output">';
    Object.entries(dir.contents).forEach(([name, item]) => {
      let className = "";
      let suffix = "";

      if (item.type === "directory") {
        className = "directory";
        suffix = "/";
      } else if (item.type === "executable") {
        className = "executable";
        suffix = "*";
      } else {
        className = "file";
      }

      output += `<span class="${className}">${name}${suffix}</span>  `;
    });
    output += "</div>";

    this.addOutput(output);
  }

  changeDirectory(path) {
    if (!path) {
      this.currentPath = "/home/user";
      return;
    }

    if (path === "..") {
      const pathParts = this.currentPath.split("/").filter((p) => p);
      if (pathParts.length > 2) {
        pathParts.pop();
        this.currentPath = "/" + pathParts.join("/");
      }
      return;
    }

    const targetPath = this.resolvePath(path);
    const dir = this.getDirectory(targetPath);

    if (!dir) {
      this.addOutput(
        `<span class="error">cd: ${path}: No such file or directory</span>`
      );
      return;
    }

    this.currentPath = targetPath;
  }

  async readFile(filename) {
    if (!filename) {
      this.addOutput(`<span class="error">cat: missing file operand</span>`);
      return;
    }

    const filePath = this.resolvePath(filename);
    const file = this.getFile(filePath);

    if (!file) {
      this.addOutput(
        `<span class="error">cat: ${filename}: No such file or directory</span>`
      );
      return;
    }

    if (file.type === "directory") {
      this.addOutput(
        `<span class="error">cat: ${filename}: Is a directory</span>`
      );
      return;
    }

    const content = await this.loadFileContent(file);
    const formattedContent = content.replace(/\n/g, "<br>");
    this.addOutput(`<div class="output">${formattedContent}</div>`);
  }

  printWorkingDirectory() {
    this.addOutput(`<div class="output">${this.currentPath}</div>`);
  }

  clearTerminal() {
    if (!this.terminal) return;
    const outputs = this.terminal.querySelectorAll(".output");
    outputs.forEach((output) => output.remove());
  }

  whoami() {
    this.addOutput(
      `<div class="output">Vadim Gorbachev | Software Engineer | Python & Go Specialist</div>`
    );
  }

  showDate() {
    const now = new Date();
    this.addOutput(`<div class="output">${now.toString()}</div>`);
  }

  echo(text) {
    this.addOutput(`<div class="output">${text}</div>`);
  }

  runDemo() {
    this.addOutput(`<div class="output">
<span class="highlight">🚀 ML Risk Assessment API Demo (Salmon Project)</span>

<span class="success">POST /api/risk/assess</span>
Request: {"user_id": "12345", "loan_amount": 50000, "features": {...}}
Response: 200 OK
{
  "risk_score": 0.23,
  "decision": "APPROVED", 
  "confidence": 0.89,
  "processing_time_ms": 67,
  "model_version": "v2.1.3"
}

<span class="success">GET /api/features/user/12345</span>
Response: 200 OK
{
  "features": {
    "credit_history_score": 0.85,
    "income_stability": 0.92,
    "debt_ratio": 0.15
  },
  "last_updated": "2024-03-15T10:30:00Z",
  "response_time_ms": 23
}

<span class="highlight">💡 System Performance:</span>
• Average Response Time: <100ms
• Model Accuracy: 94.2%
• Uptime: 99.9%
• Daily Assessments: 15,000+

<span class="success">Real-time ML risk assessment powered by AWS Lambda!</span>
<span class="success">Check projects/ml-risk-system/ for technical details.</span>
</div>`);
  }

  commandNotFound(cmd) {
    this.addOutput(
      `<span class="error">bash: ${cmd}: command not found</span>`
    );
  }

  resolvePath(path) {
    if (!path) return this.currentPath;
    if (path.startsWith("/")) return path;

    if (this.currentPath === "/") {
      return "/" + path;
    }
    return this.currentPath + "/" + path;
  }

  getDirectory(path) {
    const item = this.getItem(path);
    return item && item.type === "directory" ? item : null;
  }

  getFile(path) {
    return this.getItem(path);
  }

  getItem(path) {
    if (path === "/") {
      return this.fileSystem["/"];
    }

    if (this.fileSystem[path]) {
      return this.fileSystem[path];
    }

    const parts = path.split("/").filter((p) => p);
    let current = this.fileSystem["/home/user"];

    if (path.startsWith("/")) {
      if (parts.length >= 2 && parts[0] === "home" && parts[1] === "user") {
        current = this.fileSystem["/home/user"];
        for (let i = 2; i < parts.length; i++) {
          if (current.contents && current.contents[parts[i]]) {
            current = current.contents[parts[i]];
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    } else {
      for (const part of parts) {
        if (current.contents && current.contents[part]) {
          current = current.contents[part];
        } else {
          return null;
        }
      }
    }

    return current;
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    this.historyIndex = Math.max(
      0,
      Math.min(this.commandHistory.length, this.historyIndex + direction)
    );

    if (this.historyIndex === this.commandHistory.length) {
      this.commandInput.value = "";
    } else {
      this.commandInput.value = this.commandHistory[this.historyIndex];
    }
  }

  autoComplete() {
    const input = this.commandInput.value;
    const [cmd, ...args] = input.split(" ");

    if (args.length === 0) {
      const commands = [
        "help",
        "ls",
        "cd",
        "cat",
        "pwd",
        "clear",
        "whoami",
        "date",
        "echo",
        "demo",
        "grep",
        "cowsay",
        "sudo",
        "scp",
        "website",
      ];
      const matches = commands.filter((c) => c.startsWith(cmd));
      if (matches.length === 1) {
        this.commandInput.value = matches[0] + " ";
      }
    } else {
      const currentDir = this.getDirectory(this.currentPath);
      if (currentDir) {
        const partial = args[args.length - 1];
        const matches = Object.keys(currentDir.contents).filter((name) =>
          name.startsWith(partial)
        );

        if (matches.length === 1) {
          args[args.length - 1] = matches[0];
          this.commandInput.value = cmd + " " + args.join(" ");
        }
      }
    }
  }

  scrollToBottom() {
    if (this.terminal) {
      this.terminal.scrollTop = this.terminal.scrollHeight;
    }
  }

  async grep(args) {
    if (args.length < 1) {
      this.addOutput(`<span class="error">grep: missing pattern</span>`);
      return;
    }

    const pattern = args[0];
    const filename = args[1];

    if (!filename) {
      this.addOutput(`<span class="error">grep: missing file operand</span>`);
      return;
    }

    const filePath = this.resolvePath(filename);
    const file = this.getFile(filePath);

    if (!file) {
      this.addOutput(
        `<span class="error">grep: ${filename}: No such file or directory</span>`
      );
      return;
    }

    if (file.type === "directory") {
      this.addOutput(
        `<span class="error">grep: ${filename}: Is a directory</span>`
      );
      return;
    }

    const content = await this.loadFileContent(file);
    const lines = content.split("\n");
    const matches = lines.filter((line) =>
      line.toLowerCase().includes(pattern.toLowerCase())
    );

    if (matches.length === 0) {
      return;
    }

    let output = '<div class="output">';
    matches.forEach((line) => {
      const highlightedLine = line.replace(
        new RegExp(`(${pattern})`, "gi"),
        '<span class="highlight">$1</span>'
      );
      output += `${highlightedLine}<br>`;
    });
    output += "</div>";

    this.addOutput(output);
  }

  cowsay(text) {
    if (!text) {
      text =
        "Hello! I'm Vadim, a Software Engineer who loves building scalable systems with Python and Go!";
    }

    const cow = `<div class="output" style="font-family: monospace; white-space: pre;">
${"_".repeat(text.length + 2)}
< ${text} >
${"-".repeat(text.length + 2)}
  \\   ^__^
   \\  (oo)\\_______
      (__)\\       )\\/\\
          ||----w |
          ||     ||
</div>`;
    this.addOutput(cow);
  }

  sudo(args) {
    const command = args.join(" ");

    if (command === "rm -rf /" || command === "rm -rf /*") {
      this.addOutput(`<div class="output">
<span class="error">sudo: rm -rf /</span>

<span class="highlight">🚨 SYSTEM PROTECTION ACTIVATED 🚨</span>

Nice try! But I've implemented proper safeguards in my systems:

<span class="success">✅ Input validation</span>
<span class="success">✅ Permission checks</span>  
<span class="success">✅ Backup strategies</span>
<span class="success">✅ Disaster recovery</span>

As a backend engineer, I always code defensively! 😄

<span class="highlight">Fun fact:</span> This is exactly the kind of edge case
I think about when designing secure systems.
</div>`);
    } else if (
      command.startsWith("apt") ||
      command.startsWith("yum") ||
      command.startsWith("pacman")
    ) {
      this.addOutput(
        `<span class="error">sudo: ${command}: command not found in portfolio environment</span>`
      );
    } else if (!command) {
      this.addOutput(`<span class="error">sudo: a command is required</span>`);
    } else {
      this.addOutput(
        `<span class="error">sudo: ${command}: Permission denied. This is a portfolio, not a real system! 😉</span>`
      );
    }
  }

  downloadFile(args) {
    if (args.length === 0) {
      this.addOutput(`<span class="error">scp: missing file operand</span>`);
      this.addOutput(`<span class="highlight">Usage: scp [file]</span>`);
      this.addOutput(`<span class="highlight">Example: scp cv.pdf</span>`);
      return;
    }

    const filename = args[0];
    const filePath = this.resolvePath(filename);
    const file = this.getFile(filePath);

    if (!file) {
      this.addOutput(
        `<span class="error">scp: ${filename}: No such file or directory</span>`
      );
      return;
    }

    if (file.type === "directory") {
      this.addOutput(
        `<span class="error">scp: ${filename}: Is a directory</span>`
      );
      this.addOutput(
        `<span class="highlight">Tip: Use 'ls' to see available files</span>`
      );
      return;
    }

    if (!file.downloadable) {
      this.addOutput(
        `<span class="error">scp: ${filename}: File not available for download</span>`
      );
      return;
    }

    this.addOutput(`<span class="success">Initiating secure copy...</span>`);
    this.addOutput(`<span class="highlight">Downloading: ${filename}</span>`);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);

        this.performDownload(file, filename);
        this.addOutput(
          `<span class="success">✅ Download completed: ${filename}</span>`
        );
      } else {
        const bar =
          "█".repeat(Math.floor(progress / 5)) +
          "░".repeat(20 - Math.floor(progress / 5));
        const lastOutput = this.terminal.querySelector(
          ".output:nth-last-child(2)"
        );
        if (lastOutput && lastOutput.textContent.includes("[")) {
          lastOutput.innerHTML = `<span class="highlight">[${bar}] ${Math.floor(
            progress
          )}%</span>`;
        } else {
          this.addOutput(
            `<span class="highlight">[${bar}] ${Math.floor(progress)}%</span>`
          );
        }
      }
    }, 100);
  }

  async performDownload(file, filename) {
    try {
      let content;
      let mimeType = file.mimeType || "text/plain";

      if (file.realFile) {
        await this.downloadRealFile(file.realFile, filename, mimeType);
        return;
      }

      content = await this.loadFileContent(file);

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      this.addOutput(
        `<span class="error">scp: Download failed - ${error.message}</span>`
      );
    }
  }

  async downloadRealFile(realFileName, displayName, mimeType) {
    try {
      const response = await fetch(`./files/${realFileName}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = displayName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        throw new Error("Real file not found, using content fallback");
      }
    } catch (error) {
      const file = this.getFile(this.resolvePath(displayName));
      const content = await this.loadFileContent(file);
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = displayName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }

  async processPipeCommand(command) {
    const parts = command.split("|").map((part) => part.trim());

    if (parts.length !== 2) {
      this.addOutput(
        `<span class="error">bash: syntax error near unexpected token '|'</span>`
      );
      return;
    }

    const [leftCmd, rightCmd] = parts;
    const [rightCmdName, ...rightArgs] = rightCmd.split(" ");

    let leftOutput = "";

    const [leftCmdName, ...leftArgs] = leftCmd.split(" ");

    switch (leftCmdName.toLowerCase()) {
      case "cat":
        leftOutput = await this.getCatOutput(leftArgs[0]);
        break;
      case "ls":
        leftOutput = this.getLsOutput(leftArgs[0]);
        break;
      case "echo":
        leftOutput = leftArgs.join(" ");
        break;
      default:
        this.addOutput(
          `<span class="error">bash: ${leftCmdName}: command not found in pipe</span>`
        );
        return;
    }

    if (!leftOutput) {
      return;
    }

    switch (rightCmdName.toLowerCase()) {
      case "grep":
        this.grepFromString(rightArgs[0], leftOutput);
        break;
      default:
        this.addOutput(
          `<span class="error">bash: ${rightCmdName}: command not found in pipe</span>`
        );
        break;
    }
  }

  async getCatOutput(filename) {
    if (!filename) {
      return null;
    }

    const filePath = this.resolvePath(filename);
    const file = this.getFile(filePath);

    if (!file) {
      this.addOutput(
        `<span class="error">cat: ${filename}: No such file or directory</span>`
      );
      return null;
    }

    if (file.type === "directory") {
      this.addOutput(
        `<span class="error">cat: ${filename}: Is a directory</span>`
      );
      return null;
    }

    return await this.loadFileContent(file);
  }

  getLsOutput(path) {
    const targetPath = path ? this.resolvePath(path) : this.currentPath;
    const dir = this.getDirectory(targetPath);

    if (!dir) {
      this.addOutput(
        `<span class="error">ls: cannot access '${
          path || this.currentPath
        }': No such file or directory</span>`
      );
      return null;
    }

    return Object.keys(dir.contents).join("\n");
  }

  grepFromString(pattern, content) {
    if (!pattern) {
      this.addOutput(`<span class="error">grep: missing pattern</span>`);
      return;
    }

    const lines = content.split("\n");
    const matches = lines.filter((line) =>
      line.toLowerCase().includes(pattern.toLowerCase())
    );

    if (matches.length === 0) {
      return;
    }

    let output = '<div class="output">';
    matches.forEach((line) => {
      const highlightedLine = line.replace(
        new RegExp(`(${pattern})`, "gi"),
        '<span class="highlight">$1</span>'
      );
      output += `${highlightedLine}<br>`;
    });
    output += "</div>";

    this.addOutput(output);
  }
}

// Initialize the portfolio when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing portfolio...");
  window.portfolioSite = new PortfolioSite();
});
