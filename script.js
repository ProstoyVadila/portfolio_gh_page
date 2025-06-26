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
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleNavLinkClick(e.currentTarget);
      });
    });
  }

  handleNavLinkClick(link) {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const performScroll = () => {
        const navbarHeight =
          document.querySelector(".navbar").offsetHeight || 0;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - navbarHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      };

      if (this.mobileNav && this.mobileNav.isMenuOpen) {
        this.mobileNav.closeMenu();
        setTimeout(performScroll, 350); // Wait for menu animation
      } else {
        performScroll();
      }
    } else {
      console.warn(`Target element not found: ${targetId}`);
    }
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
      website.classList.add("active");
      this.isTerminalMode = false;

      // Force scroll to top
      window.scrollTo(0, 0);

      // Ensure mobile nav is properly initialized
      if (!this.mobileNav.hamburger) {
        this.mobileNav.setupElements();
      }

      // Re-setup navigation after mode switch
      this.setupNavigationScrolling();

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
    this.themes = {
      gruvbox: {
        "--bg0-hard": "#1d2021",
        "--bg0": "#282828",
        "--bg0-soft": "#32302f",
        "--bg1": "#3c3836",
        "--bg2": "#504945",
        "--bg3": "#665c54",
        "--bg4": "#7c6f64",
        "--fg0": "#fbf1c7",
        "--fg1": "#ebdbb2",
        "--fg2": "#d5c4a1",
        "--fg3": "#bdae93",
        "--fg4": "#a89984",
        "--red": "#cc241d",
        "--green": "#98971a",
        "--yellow": "#d79921",
        "--blue": "#458588",
        "--purple": "#b16286",
        "--aqua": "#689d6a",
        "--orange": "#d65d0e",
        "--gray": "#928374",
        "--bright-red": "#fb4934",
        "--bright-green": "#b8bb26",
        "--bright-yellow": "#fabd2f",
        "--bright-blue": "#83a598",
        "--bright-purple": "#d3869b",
        "--bright-aqua": "#8ec07c",
        "--bright-orange": "#fe8019",
        "--bright-gray": "#a89984"
      },
      solarized: {
        "--bg0-hard": "#002b36",
        "--bg0": "#073642",
        "--bg0-soft": "#0a4351",
        "--bg1": "#586e75",
        "--bg2": "#657b83",
        "--bg3": "#839496",
        "--bg4": "#93a1a1",
        "--fg0": "#eee8d5",
        "--fg1": "#fdf6e3",
        "--fg2": "#93a1a1",
        "--fg3": "#839496",
        "--fg4": "#657b83",
        "--red": "#dc322f",
        "--green": "#859900",
        "--yellow": "#b58900",
        "--blue": "#268bd2",
        "--purple": "#d33682",
        "--aqua": "#2aa198",
        "--orange": "#cb4b16",
        "--gray": "#93a1a1",
        "--bright-red": "#cb4b16",
        "--bright-green": "#586e75",
        "--bright-yellow": "#657b83",
        "--bright-blue": "#839496",
        "--bright-purple": "#6c71c4",
        "--bright-aqua": "#93a1a1",
        "--bright-orange": "#cb4b16",
        "--bright-gray": "#eee8d5"
      },
      dracula: {
        "--bg0-hard": "#282a36",
        "--bg0": "#282a36",
        "--bg0-soft": "#2d2f3d",
        "--bg1": "#44475a",
        "--bg2": "#44475a",
        "--bg3": "#6272a4",
        "--bg4": "#6272a4",
        "--fg0": "#f8f8f2",
        "--fg1": "#f8f8f2",
        "--fg2": "#bd93f9",
        "--fg3": "#6272a4",
        "--fg4": "#44475a",
        "--red": "#ff5555",
        "--green": "#50fa7b",
        "--yellow": "#f1fa8c",
        "--blue": "#bd93f9",
        "--purple": "#ff79c6",
        "--aqua": "#8be9fd",
        "--orange": "#ffb86c",
        "--gray": "#6272a4",
        "--bright-red": "#ff6e6e",
        "--bright-green": "#69ff94",
        "--bright-yellow": "#ffffa5",
        "--bright-blue": "#d6acff",
        "--bright-purple": "#ff92df",
        "--bright-aqua": "#a4ffff",
        "--bright-orange": "#ffca8a",
        "--bright-gray": "#f8f8f2"
      }
    };

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
            content: null
          },
          "README.md": {
            type: "file",
            downloadable: true,
            mimeType: "text/plain",
            realFile: "README.md",
            content: null
          },
          "cv.pdf": {
            type: "file",
            downloadable: true,
            mimeType: "application/pdf",
            realFile: "cv.pdf",
            content: `📄 CV/Resume - Vadim Gorbachev\n\nThis is a PDF file. Use 'scp cv.pdf' to download the full resume.\n\nQuick Overview:\n==============\nSenior Software Engineer specializing in Python and Go\nCurrently at Salmon (Filipino Bank) developing ML risk models\nPrevious experience at Tetrika School and Sberbank\nExpert in microservices, WebSocket systems, and ETL pipelines\n\nContact: vadim.gorbachev.dev@gmail.com\nLocation: Puerto Princesa, Philippines\n\n[Download full PDF: cv.pdf]`
          },
          "contact.txt": {
            type: "file",
            downloadable: true,
            mimeType: "text/plain",
            realFile: "contact.txt",
            content: null
          },
          projects: {
            type: "directory",
            contents: {
              "ml-risk-system": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# ML Risk Assessment System (Salmon Project)\n\n## Overview\nDeveloped and deployed ML risk models using AWS Lambda for POS (Point of Sale) product at Salmon, a Filipino fintech company.\n\n## Key Components\n- **Feature Store**: Centralized feature management for ML models\n- **Models API Service**: RESTful API for risk score calculation  \n- **Decision-Making System**: Automated loan approval/rejection logic\n\n## Technical Stack\n- **Languages**: Python\n- **Cloud**: AWS Lambda, AWS Rekognition\n- **Databases**: PostgreSQL\n- **Streaming**: Apache Kafka\n- **Infrastructure**: Terraform, Kubernetes\n\n## Achievements\n🎯 <100ms average response time for risk scoring\n🎯 99.9% uptime for critical risk assessment services\n🎯 Successfully contributed to launching new credit product\n🎯 Improved inter-team collaboration through clean API contracts\n\n## Business Impact\n- Automated manual risk assessment processes\n- Improved accuracy of credit decisions\n- Built audit trails for regulatory compliance`
                  }
                }
              },
              "websocket-chat": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Real-Time Chat System (Tetrika School)\n\n## Overview\nRedesigned WebSocket microservice for real-time lesson communication, supporting thousands of concurrent students and teachers.\n\n## The Challenge\n- Connection drops during high load\n- Duplicated messages in Python Tornado service\n- Memory consumption issues\n- Limited horizontal scaling capabilities\n\n## Solution\nMigrated from Python Tornado to **Go with Centrifuge framework**\n\n## Architecture\n- **Backend**: Go with Centrifuge framework\n- **Message Broker**: Redis Pub/Sub for horizontal scaling\n- **Load Balancer**: nginx with sticky sessions\n- **Deployment**: Kubernetes cluster with auto-scaling\n\n## Key Results\n🚀 Reduced resource consumption by 60%\n🚀 Eliminated critical bugs like message duplication\n🚀 Horizontal scaling with Redis clustering\n🚀 99.9% uptime during peak usage periods\n\n## Frontend Integration\nAlso contributed to NextJS WebSocket component rewrite:\n- Improved connection state management\n- Better error handling and user feedback`
                  }
                }
              },
              "etl-pipeline": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# ETL Data Pipeline (Sberbank Project)\n\n## Overview\nDeveloped ETL pipeline for real estate and vehicle price evaluation using classified ads data from Russia and neighboring countries.\n\n## Project Scope\n- **Data Sources**: Multiple platforms (Avito, Auto.ru, etc.)\n- **Geographic Coverage**: Russia and CIS countries\n- **Data Volume**: Millions of listings processed daily\n- **Purpose**: Price evaluation models for loan risk assessment\n\n## My Contributions\n\n### Parser Development\n- Implemented new parsers for real estate and vehicle platforms\n- Built anti-detection mechanisms and proxy rotation systems\n- Created robust data extraction logic handling various site structures\n\n### Microservice Enhancements  \n- Enhanced proxy management microservice (Flask)\n- Improved ORM service using SQLAlchemy\n- Implemented error handling and retry mechanisms\n\n### Data Processing\n- Data cleaning and normalization using Pandas\n- Created analytics queries for data quality assessment\n- Developed monitoring dashboards for data flow tracking\n\n## Technology Stack\n- **Languages**: Python\n- **Frameworks**: Scrapy (customized), Flask, SQLAlchemy  \n- **Databases**: PostgreSQL, Memcached\n- **Message Queue**: RabbitMQ\n- **Monitoring**: Kibana, Prometheus\n- **CI/CD**: GitLab CI, Jenkins\n\n## Business Impact\n- Provided accurate market data for loan decisions\n- Replaced manual price research with automated system\n- Eliminated need for expensive third-party data providers`
                  }
                }
              },
              parsera: {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Parsera - Web Scraping Platform\n\n## Overview\nPet project of a scalable 24/7 crawler platform based on microservices architecture. Started to deepen knowledge in system design and explore Go and Rust frameworks.\n\n## Architecture Design\n- **Microservices**: Separate services for different responsibilities\n- **Multi-language**: Services written in Python, Go, and Rust\n- **Scalability**: Designed for 24/7 operation\n- **Flexibility**: Easy addition of new parsers through API/web interface\n\n## System Components\n- **Parser Management Service** (Go): Handles parser configuration\n- **Data Processing Service** (Rust): High-performance data cleaning\n- **Web Interface** (Python): User-friendly parser management UI\n- **Queue Manager** (Go): Task distribution and monitoring\n- **Storage Service** (Rust): Optimized data persistence layer\n\n## Technical Stack\n- **Languages**: Python, Go, Rust\n- **Databases**: PostgreSQL for data storage\n- **Message Queue**: RabbitMQ for task distribution\n- **Cache**: Redis for performance optimization\n- **Deployment**: Docker containers\n\n## Learning Outcomes\n- **System Design**: Understanding of distributed systems principles\n- **Go Development**: Proficiency in Go for backend services\n- **Rust Programming**: Experience with Rust for performance-critical components\n- **DevOps**: Docker containerization and service orchestration\n\n## Current Status\n- Active development since August 2023\n- Core services implemented and tested\n- Docker-based deployment pipeline\n\nSource: Personal GitHub repository`
                  }
                }
              },
              goproj: {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Goproj - Go Project Template CLI\n\n## Overview\nA smart CLI tool for Go project initialization with customizable templates and configurations.\n\n## Features\n- **Smart Templates**: Automatically generates project structure\n- **Customizable**: Configure templates through arguments or config file\n- **Comprehensive Setup**: Includes all essential project files\n- **Developer Tools**: Integrates with Git and VS Code\n\n## Generated Project Structure\n\`\`\`\nproject-name/\n├── main.go\n├── go.mod\n├── Dockerfile (with latest Alpine version check)\n├── Makefile\n├── .gitignore\n├── LICENSE\n├── README.md\n└── cmd/main/main.go\n\`\`\`\n\n## Key Features\n🚀 **Alpine Version Check**: Automatically fetches latest Alpine Linux version\n🚀 **Interactive Mode**: Step-by-step project configuration\n🚀 **Config File Support**: Save preferences for future projects\n🚀 **Git Integration**: Automatic repository initialization\n🚀 **VS Code Setup**: Workspace configuration for optimal development\n\n## Technical Implementation\n- **Language**: Go\n- **CLI Framework**: Cobra for command-line interface\n- **Templates**: Go templates for file generation\n- **HTTP Client**: For fetching latest Alpine versions\n\n## Installation\n\`\`\`bash\ngo install github.com/ProstoyVadila/goproj@latest\n\`\`\`\n\n## Benefits\n- Reduces project setup time from minutes to seconds\n- Ensures consistent project structure across teams\n- Includes Go community best practices\n\nSource: github.com/ProstoyVadila/goproj`
                  }
                }
              }
            }
          },
          skills: {
            type: "directory",
            contents: {
              "languages.txt": {
                type: "file",
                downloadable: true,
                mimeType: "text/plain",
                realFile: "languages.txt",
                content: null
              },
              "databases.txt": {
                type: "file",
                downloadable: true,
                mimeType: "text/plain",
                realFile: "databases.txt",
                content: null
              },
              "cloud.txt": {
                type: "file",
                downloadable: true,
                mimeType: "text/plain",
                realFile: "cloud.txt",
                content: null
              }
            }
          }
        }
      }
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
      if (
        !e.target.closest(".website") &&
        this.commandInput &&
        window.getSelection().toString().length === 0
      ) {
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
      this.processCommand(command);
    } else {
      this.addToHistory("");
    }

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
      case "history":
        this.showHistory();
        break;
      case "theme":
        this.setTheme(args[0]);
        break;
      case "":
        break;
      default:
        this.commandNotFound(cmd);
        break;
    }
  }

  showHelp() {
    const helpText = `<div class="output">\n<span class="highlight">Available Commands:</span><br />\n<br />\n<span class="success">Navigation:</span><br />\n• ls [path]     - List files and directories<br />\n• cd [path]     - Change directory<br />\n• pwd           - Show current directory<br />\n• cat [file]    - Display file content<br />\n<br />\n<span class="success">System:</span><br />\n• help          - Show this help message<br />\n• clear         - Clear the terminal<br />\n• whoami        - Display user information<br />\n• date          - Show current date and time<br />\n• echo [text]   - Display text<br />\n• history       - Show command history<br />\n• theme [name]  - Change terminal theme (gruvbox, solarized, dracula)<br />\n<br />\n<span class="success">Search & Text:</span><br />\n• grep [pattern] [file] - Search for patterns in files<br />\n• cowsay [text] - ASCII cow says your text<br />\n• scp [file]    - Download file to your computer<br />\n<br />\n<span class="success">Portfolio:</span><br />\n• demo          - Run interactive project demo<br />\n• website       - Switch to website view<br />\n• exit          - Close the terminal window<br />\n<br />\n<span class="success">Pipes:</span><br />\n• cat file | grep pattern - Search within file content<br />\n• ls | grep pattern       - Filter directory listings<br />\n<br />\n<span class="highlight">Tips:</span><br />\n• Use Tab for auto-completion<br />\n• Use ↑/↓ arrow keys for command history<br />\n• Try: cat about.txt | grep backend<br />\n• Use 'website' or 'exit' command or click the red button to switch views<br />\n</div>`;
    this.addOutput(helpText);
  }

  setTheme(themeName) {
    if (!themeName) {
      this.addOutput(
        `<span class="error">theme: missing theme name. Available themes: gruvbox, solarized, dracula</span>`
      );
      return;
    }

    const theme = this.themes[themeName.toLowerCase()];
    if (!theme) {
      this.addOutput(
        `<span class="error">theme: unknown theme '${themeName}'. Available themes: gruvbox, solarized, dracula</span>`
      );
      return;
    }

    for (const [key, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(key, value);
    }

    this.addOutput(
      `<span class="success">Theme changed to ${themeName}.</span>`
    );
  }

  showHistory() {
    let historyOutput = '<div class="output">';
    this.commandHistory.forEach((command, index) => {
      historyOutput += `<div><span class="highlight">${
        index + 1
      }</span> ${command}</div>`;
    });
    historyOutput += "</div>";
    this.addOutput(historyOutput);
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
    this.addOutput(`<div class="output">\n<span class="highlight">🚀 ML Risk Assessment API Demo (Salmon Project)</span>\n\n<span class="success">POST /api/risk/assess</span>\nRequest: {"user_id": "12345", "loan_amount": 50000, "features": {...}}\nResponse: 200 OK\n{\n  "risk_score": 0.23,\n  "decision": "APPROVED", \n  "confidence": 0.89,\n  "processing_time_ms": 67,\n  "model_version": "v2.1.3"\n}\n\n<span class="success">GET /api/features/user/12345</span>\nResponse: 200 OK\n{\n  "features": {\n    "credit_history_score": 0.85,\n    "income_stability": 0.92,\n    "debt_ratio": 0.15\n  },\n  "last_updated": "2024-03-15T10:30:00Z",\n  "response_time_ms": 23\n}\n\n<span class="highlight">💡 System Performance:</span>\n• Average Response Time: <100ms\n• Model Accuracy: 94.2%\n• Uptime: 99.9%\n• Daily Assessments: 15,000+\n\n<span class="success">Real-time ML risk assessment powered by AWS Lambda!</span>\n<span class="success">Check projects/ml-risk-system/ for technical details.</span>\n</div>`);
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

    const cow = `<div class="output" style="font-family: monospace; white-space: pre;">\n${"_".repeat(text.length + 2)}\n< ${text} >\n${"-".repeat(text.length + 2)}\n  \\   ^__^\n   \\  (oo)\\_______\n      (__)\\       )\\/\\\n          ||----w |\n          ||     ||\n</div>`;
    this.addOutput(cow);
  }

  sudo(args) {
    const command = args.join(" ");

    if (command === "rm -rf /" || command === "rm -rf /*") {
      this.addOutput(`<div class="output">\n<span class="error">sudo: rm -rf /</span>\n\n<span class="highlight">🚨 SYSTEM PROTECTION ACTIVATED 🚨</span>\n\nNice try! But I've implemented proper safeguards in my systems:\n\n<span class="success">✅ Input validation</span>\n<span class="success">✅ Permission checks</span>  \n<span class="success">✅ Backup strategies</span>\n<span class="success">✅ Disaster recovery</span>\n\nAs a backend engineer, I always code defensively! 😄\n\n<span class="highlight">Fun fact:</span> This is exactly the kind of edge case\nI think about when designing secure systems.\n</div>`);
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
      const mimeType = file.mimeType || "text/plain";
      let blob;

      if (file.realFile) {
        try {
          const response = await fetch(`./files/${file.realFile}`);
          if (response.ok) {
            blob = await response.blob();
          } else {
            throw new Error("Real file not found, using content fallback");
          }
        } catch (error) {
          const content = await this.loadFileContent(file);
          blob = new Blob([content], { type: mimeType });
        }
      } else {
        const content = await this.loadFileContent(file);
        blob = new Blob([content], { type: mimeType });
      }

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
