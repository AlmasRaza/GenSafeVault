// buttons.js - مکمل اپڈیٹ شدہ ورژن

async function addAccount() {
    let inputs = getInputs();
    if (!inputs.account || !inputs.pass || !inputs.pin) return alert("Please fill in Account Name, Master Password, and PIN.");
    if (isNaN(inputs.length) || inputs.length < 1 || inputs.length > 128) return alert("Please enter a valid password length.");
    if (currentDatabase.find(i => i.account.toLowerCase() === inputs.account.toLowerCase())) return alert("Account already exists! Use update button.");
    
    let ruleToSave = { ...inputs };
    delete ruleToSave.pass;
    delete ruleToSave.pin;
    
    currentDatabase.push(ruleToSave);
    let hash = await generateHash(inputs.account, inputs.pass, inputs.pin);
    logToUI(`➕ Added: ${inputs.account}\n🔑 ${formatPassword(hash, ruleToSave)}`, 'log-added');
}

async function searchAccount() {
    let {account, pass, pin} = getInputs();
    if (!account || !pass || !pin) return alert("Please fill in Account Name, Master Password, and PIN.");
    
    let rule = currentDatabase.find(i => i.account.toLowerCase() === account.toLowerCase());
    if (!rule) return alert("❌ Account not found in your vault.");
    
    document.getElementById('passLength').value = rule.length;
    document.getElementById('allowedSymbols').value = rule.symbols || "";
    document.getElementById('onlyNumbers').checked = rule.onlyNumbers || false;
    document.getElementById('includeSpaces').checked = rule.includeSpaces || false;
    document.getElementById('startUpper').checked = rule.startUpper || false;
    document.getElementById('mustInclude').checked = rule.mustInclude || false;
    document.getElementById('noConsecUpper').checked = rule.noConsecUpper || false;
    document.getElementById('noConsecNum').checked = rule.noConsecNum || false;
    document.getElementById('noConsecSym').checked = rule.noConsecSym || false;
    document.getElementById('noDupChars').checked = rule.noDupChars || false;
    document.getElementById('noDupNums').checked = rule.noDupNums || false;
    document.getElementById('noDupSyms').checked = rule.noDupSyms || false;
    
    syncUIConstraints();
    
    let hash = await generateHash(rule.account, pass, pin);
    logToUI(`🔍 Found: ${rule.account}\n🔑 Password: ${formatPassword(hash, rule)}`, 'log-info');
}

async function updateAccount() {
    let inputs = getInputs();
    if (!inputs.account || !inputs.pass || !inputs.pin) return alert("Please fill in Account Name, Master Password, and PIN.");
    if (isNaN(inputs.length) || inputs.length < 1) return alert("Please enter a valid password length.");

    let index = currentDatabase.findIndex(i => i.account.toLowerCase() === inputs.account.toLowerCase());
    if (index === -1) return alert("❌ Account not found.");
    if (!confirm("Are you sure you want to update the rules for this account?")) return;
    
    let ruleToSave = { ...inputs };
    delete ruleToSave.pass;
    delete ruleToSave.pin;

    currentDatabase[index] = ruleToSave;
    let hash = await generateHash(inputs.account, inputs.pass, inputs.pin);
    logToUI(`🔄 Updated: ${inputs.account}\n🔑 New: ${formatPassword(hash, ruleToSave)}`, 'log-updated');
}

function deleteAccount() {
    let {account} = getInputs();
    let index = currentDatabase.findIndex(i => i.account.toLowerCase() === account.toLowerCase());
    if (index === -1) return alert("❌ Account not found.");
    if (!confirm(`Are you sure you want to delete '${account}'?`)) return;
    
    currentDatabase.splice(index, 1);
    logToUI(`🗑️ Deleted: ${account}`, 'log-deleted');
    document.getElementById('accountName').value = '';
}

// ایکسپورٹ فنکشن (بہترین ورژن)
async function exportDatabase() {
    let {pass, pin} = getInputs();
    if(!pass || !pin) return alert("Master Password and PIN are required for securely encrypting your vault.");
    if (currentDatabase.length === 0) return alert("Database is empty. Nothing to export.");

    try {
        let key = await deriveAESKey(pass, pin);
        let encStr = await encryptData(JSON.stringify(currentDatabase), key);
        
        const fileName = "my_gensafe_vault.json";
        const jsonContent = JSON.stringify({data: encStr}, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });

        // موبائل ایپ/اینڈرائیڈ شیئرنگ
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'GenSafe Vault',
                text: 'Your encrypted GenSafe backup.'
            });
            logToUI(`💾 Vault Shared via System!`, 'log-info');
        } 
        // براؤزر ڈاؤن لوڈ (ہر حال میں کام کرے گا)
        else {
            const url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.style.display = "none";
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            logToUI(`💾 Vault Downloaded!`, 'log-info');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error("Export Error:", err);
            alert("❌ Action failed: " + err.message);
        }
    }
}

function flushMemory() {
    currentDatabase = []; 
    isFileLoaded = false;
    document.getElementById('accountName').value = '';
    document.getElementById('masterPass').value = '';
    document.getElementById('masterPin').value = '';
    document.getElementById('dbFile').value = '';
    document.getElementById('outputLog').innerHTML = '';
    alert("Memory has been completely flushed.");
}
