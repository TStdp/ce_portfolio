document.addEventListener('DOMContentLoaded', () => {
    /* ================= 1. MOBILE MENU ================= */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    /* ================= 2. CODE BOOT REVEAL ANIMATION ================= */
    const bootOverlay = document.getElementById('boot-overlay');
    const bootLog = document.getElementById('boot-log');
    const bootProgressBar = document.getElementById('boot-progress-bar');
    const skipBootBtn = document.getElementById('skip-boot-btn');

    if (bootOverlay && bootLog && bootProgressBar) {
        const alreadyBooted = sessionStorage.getItem('cePortfolioBooted');
        if (alreadyBooted) {
            bootOverlay.remove();
        } else {
            const lines = [
                '[0.004s] INIT BIOS_CE_2030 :: Checking silicon integrity...',
                '[0.042s] CPU0: Alex_Chen_Core (Incoming Computer Engineering) [OK]',
                '[0.118s] MEM : Loading embedded C++, Verilog & PCB schematics... 32768MB OK',
                '[0.205s] BUS : Mounting /projects, /achievements, /about, /contact',
                '[0.310s] BENCH: Initializing Interactive Jigsaw Workstation Assembler...',
                '[0.420s] EXEC: ./render_portfolio --mode=interactive --theme=engineering',
                '[READY] System online. Welcome!'
            ];

            let lineIndex = 0;
            let finished = false;

            function finishBoot() {
                if (finished) return;
                finished = true;
                sessionStorage.setItem('cePortfolioBooted', 'true');
                bootOverlay.classList.add('fade-out');
                setTimeout(() => bootOverlay.remove(), 650);
            }

            const bootTimer = setInterval(() => {
                if (lineIndex < lines.length) {
                    bootLog.textContent += lines[lineIndex] + '\n';
                    bootLog.scrollTop = bootLog.scrollHeight;
                    lineIndex += 1;
                    const pct = Math.round((lineIndex / lines.length) * 100);
                    bootProgressBar.style.width = pct + '%';
                } else {
                    clearInterval(bootTimer);
                    setTimeout(finishBoot, 420);
                }
            }, 240);

            if (skipBootBtn) {
                skipBootBtn.addEventListener('click', () => {
                    clearInterval(bootTimer);
                    finishBoot();
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    clearInterval(bootTimer);
                    finishBoot();
                }
            });
        }
    }

    /* ================= 3. INTERACTIVE JIGSAW PC BUILDER ================= */
    const partSpecs = {
        mobo: {
            title: 'ATX Motherboard (Z790 Chipset)',
            desc: 'The central printed circuit board (PCB) routing high-speed PCIe lanes, power phases, and memory traces between every subsystem.',
            spec: 'BUS: DMI 4.0 x8 | VRM: 16+1+2 Digital Power Stages'
        },
        cpu: {
            title: 'Multi-Core Processor (CPU)',
            desc: 'Executes compiled machine instructions through pipelined ALUs, branch predictors, and multi-level L1/L2/L3 caches.',
            spec: 'ARCH: 64-Bit Out-of-Order | Clock: 5.4 GHz Boost'
        },
        ram: {
            title: '32GB DDR5 Dual-Channel Memory',
            desc: 'Volatile high-bandwidth storage holding active firmware toolchains, waveform simulations, and OS kernel pages.',
            spec: 'BANDWIDTH: 96 GB/s | Timing: CL30 @ 6000 MT/s'
        },
        ssd: {
            title: '2TB NVMe M.2 Solid-State Drive',
            desc: 'Non-volatile NAND flash connected directly to CPU PCIe Gen4 lanes for rapid synthesis and compilation I/O.',
            spec: 'INTERFACE: PCIe 4.0 x4 | Sequential Read: 7,300 MB/s'
        },
        gpu: {
            title: 'RTX Parallel Compute GPU',
            desc: 'Thousands of parallel shader/CUDA cores accelerating 3D CAD rendering, SPICE circuit sweeps, and computer vision models.',
            spec: 'COMPUTE: Tensor + CUDA Cores | VRAM: 16GB GDDR6X'
        },
        psu: {
            title: '850W 80+ Gold Modular PSU',
            desc: 'Converts AC mains to tightly regulated +12V, +5V, and +3.3V DC rails with over-voltage and short-circuit protection.',
            spec: 'EFFICIENCY: 92% @ 50% Load | Ripple: < 15mV'
        }
    };

    const installedParts = new Set();
    const partsCounter = document.getElementById('parts-counter');
    const chassisStatus = document.getElementById('chassis-status');
    const powerBtn = document.getElementById('power-btn');
    const resetPcBtn = document.getElementById('reset-pc-btn');
    const pcChassis = document.getElementById('pc-chassis');
    const pcPostBanner = document.getElementById('pc-post-banner');
    const partInspector = document.getElementById('part-inspector');
    const telemetryLog = document.getElementById('telemetry-log');

    function appendLog(msg, type = '') {
        if (!telemetryLog) return;
        const div = document.createElement('div');
        div.className = 'log-entry ' + type;
        div.textContent = msg;
        telemetryLog.appendChild(div);
        telemetryLog.scrollTop = telemetryLog.scrollHeight;
    }

    function showPartInfo(partKey) {
        const info = partSpecs[partKey];
        if (!info || !partInspector) return;
        partInspector.innerHTML = `
            <h4>${info.title}</h4>
            <p>${info.desc}</p>
            <div class="inspector-spec">${info.spec}</div>
        `;
    }

    function installPart(partKey) {
        if (!partSpecs[partKey]) return;
        showPartInfo(partKey);

        // Require motherboard before CPU/RAM/SSD/GPU for authentic engineering order
        const needsMobo = ['cpu', 'ram', 'ssd', 'gpu'];
        if (needsMobo.includes(partKey) && !installedParts.has('mobo')) {
            appendLog('[WARN] Install the ATX Motherboard first before seating ' + partKey.toUpperCase() + '!', 'warn');
            const moboBtn = document.querySelector('.part-item[data-part="mobo"]');
            if (moboBtn) {
                moboBtn.style.borderColor = '#f59e0b';
                setTimeout(() => (moboBtn.style.borderColor = ''), 800);
            }
            return;
        }

        if (installedParts.has(partKey)) {
            appendLog('[INFO] ' + partSpecs[partKey].title + ' is already seated.');
            return;
        }

        installedParts.add(partKey);

        const btn = document.querySelector(`.part-item[data-part="${partKey}"]`);
        if (btn) {
            btn.classList.add('installed');
            const actionLabel = btn.querySelector('.part-action');
            if (actionLabel) actionLabel.textContent = '✓ Seated';
        }

        const slot = document.querySelector(`.jigsaw-slot[data-slot="${partKey}"]`);
        if (slot) {
            slot.classList.add('snapped');
        }

        if (partsCounter) {
            partsCounter.textContent = `${installedParts.size} / 6 Installed`;
        }

        appendLog(`[OK] Snapped ${partSpecs[partKey].title} into chassis.`, 'ok');

        if (installedParts.size === 6 && powerBtn && chassisStatus) {
            powerBtn.disabled = false;
            chassisStatus.textContent = 'STATUS: READY TO BOOT';
            appendLog('[READY] All 6 hardware subsystems verified. Press "Power On System"!', 'ok');
        }
    }

    document.querySelectorAll('.part-item').forEach(btn => {
        btn.addEventListener('click', () => {
            installPart(btn.getAttribute('data-part'));
        });
    });

    document.querySelectorAll('.jigsaw-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            installPart(slot.getAttribute('data-slot'));
        });
    });

    if (powerBtn) {
        powerBtn.addEventListener('click', () => {
            if (installedParts.size < 6) return;
            pcChassis.classList.add('powered-on');
            pcPostBanner.classList.remove('hidden');
            chassisStatus.textContent = 'STATUS: ONLINE (POST OK)';
            chassisStatus.classList.add('online');
            powerBtn.textContent = '✓ System Running';
            powerBtn.disabled = true;
            appendLog('[BOOT] +12V/+5V/+3.3V rails nominal. Workstation ONLINE!', 'ok');
        });
    }

    if (resetPcBtn) {
        resetPcBtn.addEventListener('click', () => {
            installedParts.clear();
            document.querySelectorAll('.part-item').forEach(btn => {
                btn.classList.remove('installed');
                const actionLabel = btn.querySelector('.part-action');
                if (actionLabel) actionLabel.textContent = '+ Snap';
            });
            document.querySelectorAll('.jigsaw-slot').forEach(slot => {
                slot.classList.remove('snapped');
            });
            if (pcChassis) pcChassis.classList.remove('powered-on');
            if (pcPostBanner) pcPostBanner.classList.add('hidden');
            if (partsCounter) partsCounter.textContent = '0 / 6 Installed';
            if (chassisStatus) {
                chassisStatus.textContent = 'STATUS: UNASSEMBLED';
                chassisStatus.classList.remove('online');
            }
            if (powerBtn) {
                powerBtn.disabled = true;
                powerBtn.textContent = '⚡ Power On System';
            }
            if (partInspector) {
                partInspector.innerHTML = '<p class="inspector-placeholder">Select or install any component to inspect its architecture role in a Computer Engineering workstation.</p>';
            }
            if (telemetryLog) {
                telemetryLog.innerHTML = '<div class="log-entry">[BENCH] Chassis cleared. Ready for new assembly...</div>';
            }
        });
    }

    /* ================= 4. PROJECTS PAGE FILTER & MODAL ================= */
    const projectDetails = {
        cpu: {
            tag: 'Digital Logic • Verilog',
            title: '8-Bit Breadboard & FPGA Soft-Core CPU',
            summary: 'Designed from scratch starting with boolean truth tables and Karnaugh maps, then synthesized in Verilog on a Xilinx Artix-7 FPGA.',
            bullets: [
                'Supports 16 custom opcodes including ADD, SUB, AND, XOR, JMP, JZ, LDA, and OUT.',
                'Includes a hardware program counter, instruction register, and zero/carry flag latches.',
                'Verified using GTKWave testbenches executing Fibonacci and prime-sieve assembly routines.'
            ]
        },
        rover: {
            tag: 'Embedded Systems • C++',
            title: 'PID Autonomous Maze-Solving Rover',
            summary: 'Built for regional robotics competition to autonomously map and solve a 16x16 walled labyrinth without prior map data.',
            bullets: [
                'Implemented dual-loop PID velocity & heading control at a 1 kHz timer interrupt rate.',
                'Fused 3 VL53L0X laser ToF distance sensors with wheel quadrature encoders.',
                'Reduced second-run speed-solve time by 42% using diagonal path smoothing.'
            ]
        },
        macropad: {
            tag: 'PCB Design • KiCad',
            title: 'Custom RP2040 Mechanical Macropad & OLED',
            summary: 'A 9-key programmable engineering keypad built to trigger compiler builds, oscilloscope captures, and KiCad shortcuts.',
            bullets: [
                'Routed differential USB D+/D- impedance-controlled pairs and ESD TVS diode protection.',
                'Wrote custom QMK/C firmware driving a 128x64 SSD1306 OLED over I2C.',
                'Designed a 3D-printed gasket-mount aluminum-accented enclosure.'
            ]
        },
        lora: {
            tag: 'IoT • Edge Telemetry',
            title: 'LoRa Campus Micro-Weather & Air Node',
            summary: 'Autonomous environmental sensor node engineered for multi-week battery autonomy across campus grounds.',
            bullets: [
                'Achieved 38 µA deep-sleep current draw via MOSFET power-gating of external sensors.',
                'Transmitted JSON-compressed telemetry packets over 915 MHz LoRa SX1276.',
                'Built a live Python/Chart.js receiver station logging microclimate trends.'
            ]
        },
        riscv: {
            tag: 'Systems • C11',
            title: 'Cycle-Accurate RISC-V Instruction Simulator',
            summary: 'Command-line architectural simulator written in pure C to study instruction pipelining and cache behavior.',
            bullets: [
                'Decodes standard RV32I ELF binaries and tracks all 32 integer registers.',
                'Simulates data forwarding vs. stall cycles on RAW (Read-After-Write) hazards.',
                'Includes configurable direct-mapped and 2-way set-associative L1 cache models.'
            ]
        },
        pcbcv: {
            tag: 'Computer Vision • Python',
            title: 'Automated PCB Solder-Joint Defect Detector',
            summary: 'Helps high-school robotics teammates inspect hand-soldered boards before applying power.',
            bullets: [
                'Collected and labeled 1,200 macro images of good joints, cold joints, and solder bridges.',
                'Achieved 94.3% validation accuracy with real-time bounding box overlays at 30 FPS.',
                'Prevented 3 critical power-rail short circuits during build season.'
            ]
        }
    };

    const filterChips = document.querySelectorAll('.filter-chip');
    const projectCards = document.querySelectorAll('.project-card');

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const filter = chip.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    const projectModal = document.getElementById('project-modal');
    const closeProjectModal = document.getElementById('close-project-modal');
    const modalTag = document.getElementById('modal-tag');
    const modalTitle = document.getElementById('modal-title');
    const modalSummary = document.getElementById('modal-summary');
    const modalBullets = document.getElementById('modal-bullets');

    document.querySelectorAll('.project-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-project');
            const data = projectDetails[key];
            if (!data || !projectModal) return;

            modalTag.textContent = data.tag;
            modalTitle.textContent = data.title;
            modalSummary.textContent = data.summary;
            modalBullets.innerHTML = data.bullets.map(item => `<li>${item}</li>`).join('');
            projectModal.classList.remove('hidden');
        });
    });

    if (closeProjectModal && projectModal) {
        closeProjectModal.addEventListener('click', () => projectModal.classList.add('hidden'));
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) projectModal.classList.add('hidden');
        });
    }

    /* ================= 5. CONTACT PAGE INTERACTIONS ================= */
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('email-text');
    if (copyEmailBtn && emailText) {
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(emailText.textContent.trim()).then(() => {
                copyEmailBtn.textContent = 'Copied!';
                setTimeout(() => (copyEmailBtn.textContent = 'Copy'), 1500);
            });
        });
    }

    const contactForm = document.getElementById('contact-form');
    const contactFeedback = document.getElementById('contact-feedback');
    if (contactForm && contactFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('sender-name').value.trim();
            const email = document.getElementById('sender-email').value.trim();
            const message = document.getElementById('sender-message').value.trim();

            if (!name || !email || !email.includes('@') || !message) {
                contactFeedback.textContent = '⚠ Transmission Error: Please fill in your name, a valid email address, and message payload.';
                contactFeedback.className = 'feedback-banner error';
                return;
            }

            contactFeedback.textContent = `✓ Packet Acknowledged! Thank you, ${name}. Your message has been queued for Alex Chen.`;
            contactFeedback.className = 'feedback-banner';
            contactForm.reset();
        });
    }
});
