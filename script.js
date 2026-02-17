function parseLogs() {
    const logInput = document.getElementById('logInput').value;
    const resultsDiv = document.getElementById('results');
    
    if (!logInput.trim()) {
        resultsDiv.innerHTML = '<div class="no-results">Please paste some logs to parse</div>';
        return;
    }

    const lines = logInput.split('\n');

    // Collect AI_AUTHORING logs and associate the RESPONSE that comes immediately after each
    const aiAuthoringLogs = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('AI_AUTHORING')) {
            const parts = line.split('AI_AUTHORING');
            if (parts.length === 2) {
                const timestamp = parts[0].trim();
                try {
                    const data = JSON.parse(parts[1].trim());
                    let response = null;
                    // Look ahead for RESPONSE line
                    if (i + 1 < lines.length && lines[i + 1].includes('RESPONSE')) {
                        const respParts = lines[i + 1].split('RESPONSE');
                        if (respParts.length === 2) {
                            try {
                                response = JSON.parse(respParts[1].trim());
                            } catch (e) {
                                response = respParts[1].trim();
                            }
                        }
                    }
                    aiAuthoringLogs.push({
                        timestamp,
                        data,
                        response
                    });
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                }
            }
        }
    }

    if (aiAuthoringLogs.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">No AI_AUTHORING logs found</div>';
        return;
    }

    resultsDiv.innerHTML = aiAuthoringLogs.map((log, index) => renderLogEntry(log, index)).join('');
}

function renderLogEntry(log, index) {
    const { timestamp, data, response } = log;
    const metadata = data.metadata || {};
    const subObjectives = metadata.sub_objectives || [];
    
    return `
        <div class="log-entry">
            <div class="log-header">
                <div class="timestamp">⏰ ${timestamp}</div>
                <div class="status-badge ${data.status === 'true' ? 'status-true' : 'status-false'}">
                    ${data.status === 'true' ? '✓ Success' : '✗ Failed'}
                </div>
            </div>

            ${metadata.objective ? `
                <div class="objective">
                    <div class="objective-title">Objective</div>
                    <div class="objective-text">${metadata.objective}</div>
                </div>
            ` : ''}

            <div class="sub-objectives">
                ${subObjectives.map((sub, subIndex) => renderSubObjective(sub, subIndex)).join('')}
            </div>

            ${response !== undefined && response !== null ? `
                <div class="response-block">
                    <div class="response-title">RESPONSE</div>
                    <pre class="response-json">${typeof response === 'object' ? JSON.stringify(response, null, 2) : response}</pre>
                </div>
            ` : ''}
        </div>
    `;
}

function renderSubObjective(sub, index) {
    const thought = sub.thought || {};
    const actions = sub.actions || [];
    const images = sub.images || [];
    
    return `
        <div class="sub-objective">
            <div class="sub-objective-header">
                <div class="step-number">${index + 1}</div>
                ${sub.duration ? `<div class="duration">⏱️ ${sub.duration}ms</div>` : ''}
            </div>

            ${sub.description ? `
                <div class="description">
                    <strong>📝 Description:</strong> ${sub.description}
                </div>
            ` : ''}

            ${thought.text ? `
                <div class="thought-text">
                    💭 ${thought.text}
                </div>
            ` : ''}

            ${actions.length > 0 ? `
                <div class="actions">
                    <div class="action-title">🎯 Actions</div>
                    ${actions.map(action => renderAction(action)).join('')}
                </div>
            ` : ''}

            ${images.length > 0 ? `
                <div class="images-grid">
                    ${images.map(img => `
                        <div class="image-container" onclick="openModal('${img}')">
                            <img src="${img}" alt="Screenshot" loading="lazy" />
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderAction(action) {
    const actionType = action.action_type || 'unknown';
    let actionDetails = '';
    
    if (action.variant) {
        if (action.variant.includes('click') && action.x !== undefined && action.y !== undefined) {
            actionDetails = `Click at (${action.x}, ${action.y})`;
        } else if (action.variant.includes('type') && action.content) {
            actionDetails = `Type: "${action.content}"`;
        } else if (action.variant.includes('done') && action.evidence) {
            actionDetails = action.evidence;
        }
    }
    
    return `
        <div class="action-item">
            <span class="action-type ${actionType}">${actionType}</span>
            <span>${actionDetails || action.variant || 'Action performed'}</span>
        </div>
    `;
}

// Modal functionality for full-size images
function openModal(imageSrc) {
    let modal = document.getElementById('imageModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <span class="close" onclick="closeModal()">&times;</span>
            <img class="modal-content" id="modalImage">
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('modalImage').src = imageSrc;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside the image
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Sample data for quick testing
const sampleLogs = `2026-2-9 5:2:50:819 SESSION_SETUP_TIME {"initialising_device":0}
2026-2-9 5:2:50:819 SESSION_SETUP_TIME {"downloading_app":710,"installing_app":6108,"setting_up_appium":9300,"setting_up_network_connection":0}
2026-2-9 5:2:56:484 SESSION_SETUP_TIME {"launching_app":5664}
2026-2-9 5:2:56:521 REQUEST [2026-2-9 5:2:56:521] POST /session {"capabilities":{"alwaysMatch":{"platformName":"android","appium:deviceName":".*","appium:platformVersion":".*","appium:app":"bs://d022036b419868455bc14b2d18c8c2d71bd9065d","appium:autoGrantPermissions":true,"bstack:options":{"projectName":"wdio AA Non-SDK Project","buildName":"WDIO: [PROD]WDIOMobileTests CAD NonSDK 155982","debug":true,"appiumVersion":"1.22.0","sessionName":"AI Authoring spec","aiAuthoring":true,"deviceLogs":true,"networkLogs":"true","appProfiling":"true"}},"firstMatch":[{}]},"desiredCapabilities":{"platformName":"android","appium:deviceName":".*","appium:platformVersion":".*","appium:app":"bs://d022036b419868455bc14b2d18c8c2d71bd9065d","appium:autoGrantPermissions":true,"bstack:options":{"projectName":"wdio AA Non-SDK Project","buildName":"WDIO: [PROD]WDIOMobileTests CAD NonSDK 155982","debug":true,"appiumVersion":"1.22.0","sessionName":"AI Authoring spec","aiAuthoring":true,"deviceLogs":true,"networkLogs":true,"appProfiling":true},"acceptSslCert":false,"detected_language":"webdriver/8.46.0","new_bucketing":true,"W3C_capabilities":{"alwaysMatch":{"platformName":"android","appium:deviceName":".*","appium:platformVersion":".*","appium:app":"bs://d022036b419868455bc14b2d18c8c2d71bd9065d","appium:autoGrantPermissions":true,"bstack:options":{"projectName":"wdio AA Non-SDK Project","buildName":"WDIO: [PROD]WDIOMobileTests CAD NonSDK 155982","debug":true,"appiumVersion":"1.22.0","sessionName":"AI Authoring spec","aiAuthoring":true,"deviceLogs":true,"networkLogs":"true","appProfiling":"true"}},"firstMatch":[{}]}}}
2026-2-9 5:2:56:521 START_SESSION 
2026-2-9 5:2:56:521 REQUEST [2026-2-9 5:2:56:521] GET /session/0c0e2ade3573e5cb3991409909636dc2d81ee6a1
2026-2-9 5:2:56:521 RESPONSE {"value":{"capabilities":{"platform":"LINUX","webStorageEnabled":false,"takesScreenshot":true,"javascriptEnabled":true,"databaseEnabled":false,"networkConnectionEnabled":true,"locationContextEnabled":false,"warnings":{},"desired":{"platformName":"Android","bstack:options":{"appProfiling":true},"goog:chromeOptions":{},"newCommandTimeout":0,"deviceName":".*","unicodeKeyboard":true,"resetKeyboard":true,"chromedriverPorts":[[18133,18143]],"automationName":"uiautomator2","systemPort":8203,"autoGrantPermissions":true,"bundleID":"org.wikipedia.alpha","bundleId":"org.wikipedia.alpha","skipServerInstallation":true,"udid":"R3CN504RF1V","appPackage":"org.wikipedia.alpha","appActivity":"org.wikipedia.main.MainActivity","nativeWebScreenshot":true,"disableSuppressAccessibilityService":true,"platformVersion":".*"},"platformName":"Android","bstack:options":{"appProfiling":true},"goog:chromeOptions":{},"newCommandTimeout":0,"deviceName":"R3CN504RF1V","unicodeKeyboard":true,"resetKeyboard":true,"chromedriverPorts":[[18133,18143]],"automationName":"uiautomator2","systemPort":8203,"autoGrantPermissions":true,"bundleID":"org.wikipedia.alpha","bundleId":"org.wikipedia.alpha","skipServerInstallation":true,"udid":"R3CN504RF1V","appPackage":"org.wikipedia.alpha","appActivity":"org.wikipedia.main.MainActivity","nativeWebScreenshot":true,"disableSuppressAccessibilityService":true,"platformVersion":"10","deviceUDID":"R3CN504RF1V","deviceApiLevel":29,"deviceScreenSize":"1080x2400","deviceScreenDensity":420,"deviceModel":"SM-G988B","deviceManufacturer":"samsung","pixelRatio":2.625,"statBarHeight":73,"viewportRect":{"left":0,"top":73,"width":1080,"height":2127}},"sessionId":"0c0e2ade3573e5cb3991409909636dc2d81ee6a1"}}
2026-2-9 5:2:59:575 REQUEST [2026-2-9 5:2:59:575] POST /session/0c0e2ade3573e5cb3991409909636dc2d81ee6a1/execute/sync {"script":"browserstack_executor: {\\"action\\": \\"ai\\", \\"arguments\\": [\\"Type Artificial Intelligence in the search box\\"]}","args":[]}
2026-2-9 5:3:15:624 AI_AUTHORING {"status":"true","data":{},"error":{},"metadata":{"objective":"Type Artificial Intelligence in the search box","sub_objectives":[{"thought":{"text":"I can see the Wikipedia app is open with a search box at the top. The search box shows \\"Search Wikipedia\\" placeholder text. I need to click on the search box and then type \\"Artificial Intelligence\\" as requested in the task."},"images":["https://app-automate.browserstack.com/s3-debug/browserstack-debug-screenshots-prod-use1/0c0e2ade3573e5cb3991409909636dc2d81ee6a1/screenshot-2a6436de-d231-43a6-8a28-3b811d4e9ac2_0_action_1.png","https://app-automate.browserstack.com/s3-debug/browserstack-debug-screenshots-prod-use1/0c0e2ade3573e5cb3991409909636dc2d81ee6a1/screenshot-2a6436de-d231-43a6-8a28-3b811d4e9ac2_0_action_2.png"],"status":"Success","actions":[{"variant":"mouse:click","x":640,"y":96,"action_type":"click"},{"variant":"keyboard:type","content":"Artificial Intelligence","action_type":"type"}],"formatted_actions":[],"duration":6572,"description":"I can see the Wikipedia app with a search box. I need to click on it and type 'Artificial Intelligence'.","intent":"unknown"},{"thought":{"text":"I can see that the search box has been activated and \\"Artificial Intelligence\\" has been typed in the search field at the top of the screen. The task was to type \\"Artificial Intelligence\\" in the search box, which has been successfully completed. I can see the text \\"Artificial Intelligence\\" clearly displayed in the search bar at the top of the screen."},"images":[],"status":"success","actions":[{"variant":"task:done","evidence":"The text 'Artificial Intelligence' is clearly visible in the search box at the top of the screen, confirming that the typing task has been completed successfully.","action_type":"complete"}],"formatted_actions":[],"duration":5304,"description":"Prompt executed successfully","intent":"unknown"}]}}
2026-2-9 5:3:15:624 RESPONSE {"sessionId":"0c0e2ade3573e5cb3991409909636dc2d81ee6a1","status":0,"value":{"value":null}}
2026-2-9 5:3:15:647 REQUEST [2026-2-9 5:3:15:647] POST /session/0c0e2ade3573e5cb3991409909636dc2d81ee6a1/execute/sync {"script":"browserstack_executor: {\\"action\\": \\"ai\\", \\"arguments\\": [\\"Click on Go Back button\\"]}","args":[]}
2026-2-9 5:3:29:20 AI_AUTHORING {"status":"true","data":{},"error":{},"metadata":{"objective":"Click on Go Back button","sub_objectives":[{"thought":{"text":"I can see a screen showing search results for \\"Artificial Intelligence\\" with a back arrow button visible in the top left corner. The task is to click on the \\"Go Back\\" button, which appears to be the back arrow icon at coordinates around (500, 44) based on the typical Android navigation pattern."},"images":["https://app-automate.browserstack.com/s3-debug/browserstack-debug-screenshots-prod-use1/0c0e2ade3573e5cb3991409909636dc2d81ee6a1/screenshot-6b4d352b-3fb0-425b-bdd1-c07ee2204f88_0_action_1.png"],"status":"Success","actions":[{"variant":"mouse:click","x":500,"y":44,"action_type":"click"}],"formatted_actions":[],"duration":5514,"description":"I need to click the back arrow button visible in the top left of the screen to go back.","intent":"unknown"},{"thought":{"text":"I can see that the previous action successfully clicked the back button, as evidenced by the screen now showing the Wikipedia main page instead of the search results page. The task was to click on the \\"Go Back\\" button, and this has been accomplished - we've navigated back from the search results to the main Wikipedia page."},"images":[],"status":"success","actions":[{"variant":"task:done","evidence":"The screen now shows the Wikipedia main page with the search bar and featured content, confirming that the Go Back button was successfully clicked and we navigated away from the Artificial Intelligence search results page.","action_type":"complete"}],"formatted_actions":[],"duration":5653,"description":"Prompt executed successfully","intent":"unknown"}]}}
2026-2-9 5:3:29:20 RESPONSE {"sessionId":"0c0e2ade3573e5cb3991409909636dc2d81ee6a1","status":0,"value":{"value":null}}
2026-2-9 5:3:29:41 REQUEST [2026-2-9 5:3:29:41] POST /session/0c0e2ade3573e5cb3991409909636dc2d81ee6a1/execute/sync {"script":"browserstack_executor: {\\"action\\": \\"setSessionStatus\\", \\"arguments\\": {\\"status\\": \\"passed\\", \\"reason\\": \\"passed\\" }}","args":[]}
2026-2-9 5:3:29:319 RESPONSE {"sessionId":"0c0e2ade3573e5cb3991409909636dc2d81ee6a1","status":0,"value":"{\\"automation_session\\":{\\"hashed_id\\":\\"0c0e2ade3573e5cb3991409909636dc2d81ee6a1\\",\\"name\\":\\"AI Authoring spec\\",\\"status\\":\\"passed\\",\\"os\\":\\"android\\",\\"os_version\\":\\"10.0\\",\\"browser\\":null,\\"browser_version\\":\\"app\\",\\"device\\":\\"Samsung Galaxy S20 Ultra\\",\\"duration\\":null,\\"reason\\":\\"passed\\",\\"build_name\\":\\"WDIO: [PROD]WDIOMobileTests CAD NonSDK 155982\\",\\"project_name\\":\\"wdio AA Non-SDK Project\\",\\"build_hashed_id\\":\\"b4a8856ae29824bbf4717059425b2470102d4e72\\"}}"}
2026-2-9 5:3:30:586 STOP_SESSION {"status":0,"sessionId":"0c0e2ade3573e5cb3991409909636dc2d81ee6a1","value":{"message":"CLIENT_STOPPED_SESSION"},"errorStack":{}}`;

// Auto-fill sample data on page load (optional - comment out if not needed)
window.addEventListener('DOMContentLoaded', () => {
    // Uncomment the next line to auto-fill sample data
    // document.getElementById('logInput').value = sampleLogs;
});
