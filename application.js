"use strict";

let bundles = [];
let schoolType = "state";
let leaseType = "operating";
let advanceArrears = "Advance";
let globalNumBundles = 0;
let formTwoData = null;
let formThreeData = null;
let submitted = [false];
let radiosTwoLock = [false]

const Container = document.getElementById("bundleContainer");



// Add event listener for the school type radio buttons
var radiosOne = document.getElementById("initialForm").elements["schoolTypes"];
for(var i = 0, max = radiosOne.length; i < max; i++) {
    radiosOne[i].onclick = function() {
        schoolType = this.value;
    }
}

// Event listener for the initial plus button which adds bundles
document.getElementById("addBundle").addEventListener("click", (e) => {
    e.preventDefault();
    //create a new column to put bundle forms in
    let mainFormData = new FormData(document.getElementById("initialForm"));
    let numBundles = globalNumBundles
    let col = document.createElement("div");
    col.classList.add("col");
    // Add device Form card to the column - Manufacturer, SKU and Price
    col.appendChild(generateDeviceForm(numBundles));
    col.innerHTML += "<br>"


    // insert column into index.html
    Container.insertBefore(col, Container.lastChild);

    // Event listener for the device form 
    const deviceForm = document.getElementById("deviceForm" + (numBundles).toString());
    deviceForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        let formData = new FormData(deviceForm);
        // create bundle from the device information
        let bundle = new Bundle(formData.get("manufacturer") + " "+ formData.get("SKU"), parseFloat(formData.get("sellPrice")));
        bundles.push(bundle)

        let lease = new Lease()

        // generate next stage of device form with table and soft cost controls
        deviceForm.outerHTML = bundle.leaseTypeButtons(numBundles, schoolType) + bundle.generateTable(numBundles) + bundle.generateBundleControls(numBundles, lease).innerHTML

        // create a new row for scheme cards
        let row = document.createElement("div");
        
        let scheme = new Scheme(bundle, mainFormData.get("units"));
        scheme.updateSchemeWithFormData(schoolType)
        // generate new scheme card and add to index
        const schemeCard = scheme.generateForm(numBundles)
    
        scheme.lease = lease
    
        let depositDiv = document.createElement("div")
        depositDiv.id = "depositDiv" + numBundles.toString()
        //create new column for each field
        col.classList.add("col");
        col.appendChild(row);
        col.appendChild(depositDiv)

        row.classList.add("row");
        row.classList.add("gx-3");
        row.appendChild(schemeCard);
        col.innerHTML += "<br>"

        const col2 =  document.createElement("div");
        col.appendChild(col2);

        // event listener for lease type buttons for private schools
        if(schoolType == "private"){
            let radiosTwo = document.getElementById("leaseTypeForm"+numBundles.toString()).elements["leaseTypes"];
            for(var i = 0, max = radiosTwo.length; i < max; i++) {
                radiosTwo[i].onclick = function() {
                    if(!radiosTwoLock[numBundles]){
                        leaseType = this.value;
                        scheme.setLeaseType(leaseType)
                        if(leaseType == "finance"){
                            document.getElementById("operatingControls" + numBundles.toString()).style.display = "none"
                            document.getElementById("leaseLengthSelect"+numBundles.toString()).innerHTML = `
                            <option value="" disabled selected hidden>Lease length</option>
                            <option value="2">2 years</option>
                            <option value="3">3 years</option>
                            <option value="4">4 years</option>
                            <option value="5">5 years</option>`
                        }else{
                            document.getElementById("operatingControls" + numBundles.toString()).style.display = "block"
                            document.getElementById("leaseLengthSelect"+numBundles.toString()).innerHTML = `
                            <option value="" disabled selected hidden>Lease length</option>
                            <option value="2">2 years</option>
                            <option value="3">3 years</option>`
                        }
                    }
                }
            }
        }
        

        // add event listener for form adding new add ons to the bundle
        let bundleForm = document.getElementById("bundleForm" + numBundles.toString());
        let table = document.getElementById("table"+ numBundles.toString());
        const soft = document.getElementById("softCost"+ numBundles.toString());
        // fixes the bundle if it goes over 10% by converting soft costs to services until compliant
        let disclaimer = document.getElementById("disclaimer"+ numBundles.toString());
        let fixButton = document.getElementById("fixSoftCost"+ numBundles.toString());
        bundleForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let formData = new FormData(bundleForm);
            
            // if trade in is added show the slider and add it to the bundle
            if(formData.get("bundleAddon") == "Net Vendor Incentive (Ex VAT)"){
                document.getElementById("tradeInSlider").style.display = "block"
                bundle.addTradeIn(formData.get("Price"));
            }else if(formData.get("bundleAddon") == "Net Vendor Incentive (Inc VAT)"){
                document.getElementById("tradeInSlider").style.display = "block"
                bundle.addTradeIn(parseFloat(formData.get("Price"))/1.2);
            }else{
                bundle.addAddOn(formData.get("bundleAddon"), formData.get("addonName"), parseFloat(formData.get("Price")))
            }
            // update table with new add on
            table.innerHTML = bundle.generateTable(numBundles)

            // logic if soft cost goes over 10 %
            const a = bundle.softCostPercentage();
            if (a < 10){
                soft.innerHTML = a.toString() + "%";
                soft.style = "color: #000000"   
                disclaimer.style.display = "none"
                fixButton.style.display = "none"
            }else{
                soft.innerHTML = a.toString() + "%";       
                soft.style = "color: #FF0000"   
                disclaimer.style.display = "block"
                fixButton.style.display = "inline"
            }

            if(submitted[numBundles]){
                col2.innerHTML = scheme.generatePriceCards(numBundles).outerHTML;
            }
            for (const [key, value] of Object.entries(bundle.softCopy)) {
                document.getElementById(key + numBundles.toString()).addEventListener("click", (e) => {
                    e.preventDefault();
                    bundle.removeSoftCost(key)
                    bundle.resetSoftCost()
                    document.getElementById("row" + key + numBundles.toString()).innerHTML = ""
                    document.getElementById("recalculatedTable" + numBundles.toString()).innerHTML = ""
                    const a = bundle.softCostPercentage();
                    if (a < 10){
                        soft.innerHTML = a.toString() + "%";
                        soft.style = "color: #000000"   
                        disclaimer.style.display = "none"
                        fixButton.style.display = "none"
                    }else{
                        soft.innerHTML = a.toString() + "%";       
                        soft.style = "color: #FF0000"   
                        disclaimer.style.display = "block"
                        fixButton.style.display = "inline"
                    }
                }) 
            }

            if(bundle.tradeInProportion < 1 && bundle.tradeIn > 0){
                document.getElementById("leaseTradeIn"+numBundles.toString()).addEventListener("click", (e) => {
                    e.preventDefault();
                    bundle.tradeIn = 0
                    bundle.tradeInLeft = 0
                    bundle.resetSoftCost()
                    document.getElementById("tradeInSlider").style.display = "none"
                    document.getElementById("rowLeaseTradeIn"+numBundles.toString()).innerHTML = ""
                    document.getElementById("recalculatedTable" + numBundles.toString()).innerHTML = ""
                    const a = bundle.softCostPercentage();
                    if (a < 10){
                        soft.innerHTML = a.toString() + "%";
                        soft.style = "color: #000000"   
                        disclaimer.style.display = "none"
                        fixButton.style.display = "none"
                    }else{
                        soft.innerHTML = a.toString() + "%";       
                        soft.style = "color: #FF0000"   
                        disclaimer.style.display = "block"
                        fixButton.style.display = "inline"
                    }
                }) 
            }

            if(bundle.tradeInProportion > 1 && bundle.tradeIn > 0){
                document.getElementById("outrightTradeIn"+numBundles.toString()).addEventListener("click", (e) => {
                    e.preventDefault();
                    bundle.tradeIn = 0
                    bundle.tradeInLeft = 0
                    bundle.resetSoftCost()
                    document.getElementById("tradeInSlider").style.display = "none"
                    document.getElementById("rowOutrightTradeIn"+numBundles.toString()).innerHTML = ""
                    document.getElementById("recalculatedTable" + numBundles.toString()).innerHTML = ""
                    const a = bundle.softCostPercentage();
                    if (a < 10){
                        soft.innerHTML = a.toString() + "%";
                        soft.style = "color: #000000"   
                        disclaimer.style.display = "none"
                        fixButton.style.display = "none"
                    }else{
                        soft.innerHTML = a.toString() + "%";       
                        soft.style = "color: #FF0000"   
                        disclaimer.style.display = "block"
                        fixButton.style.display = "inline"
                    }
                }) 
            }
        });

        fixButton.addEventListener("click", (e) => {
            e.preventDefault();
            bundle.fixSoftCost()
            document.getElementById("recalculatedTable" +numBundles.toString()).innerHTML = bundle.generateRecalculatedTable()
            const a = bundle.softCostPercentage();
            if (a <= 10){
                soft.innerHTML = a.toString() + "%";
                soft.style = "color: #000000"   
                disclaimer.style.display = "none"
                fixButton.style.display = "none"
            }else{
                soft.innerHTML = a.toString() + "%";       
                soft.style = "color: #FF0000"   
                disclaimer.style.display = "block"
                fixButton.style.display = "inline"
            }

            if(scheme.priceCardsGenerated){
                col2.innerHTML = scheme.generatePriceCards(numBundles).outerHTML;
            }
        });

        // add event listener for the trade in slider
        let vendor = document.getElementById("vendorProportionSlider" + numBundles.toString());
        vendor.addEventListener("input", (event) => {
            bundle.tradeInProportion = event.target.value;
            // update table with new proportions
            document.getElementById("table"+numBundles.toString()).innerHTML = bundle.generateTable(numBundles);
             // logic if soft cost goes over 10 %
             const a = bundle.softCostPercentage();
             if (a <= 10){
                 soft.innerHTML = a.toString() + "%";
                 soft.style = "color: #000000"   
                 disclaimer.style.display = "none"
                 fixButton.style.display = "none"
             }else{
                 soft.innerHTML = a.toString() + "%";       
                 soft.style = "color: #FF0000"   
                 disclaimer.style.display = "block"
                 fixButton.style.display = "inline"
             }
        });

        //dynamically generate event listeners
        const formTwo = document.getElementById("formTwo" + numBundles.toString());
        const formThree = document.getElementById("formThree" + numBundles.toString());
        const depositOverview = document.getElementById("depositOverviewCard" + numBundles.toString());
        scheme.copyFormDataAcross(formTwoData, formTwo);
        scheme.copyFormDataAcross(formThreeData, formThree);


        var radiosThree = formTwo.elements["advanceArrears"];
        for(var i = 0, max = radiosThree.length; i < max; i++) {
            radiosThree[i].onclick = function() {
                advanceArrears = this.value;
            }
        }
        formTwo.addEventListener("submit", (e) => {
            e.preventDefault();
        
            formTwoData = new FormData(formTwo);
            scheme.updateSchemeWithFormOneData(formTwoData, advanceArrears, leaseType);

            if(submitted[numBundles]){
                col2.innerHTML = scheme.generatePriceCards(numBundles).outerHTML;
            }

            radiosTwoLock[numBundles] = true
            if(schoolType == "private"){
                let radiosTwo = document.getElementById("leaseTypeForm"+numBundles.toString()).elements["leaseTypes"];
                for(var i = 0, max = radiosTwo.length; i < max; i++) {
                    radiosTwo[i].disabled = true;
                }
            }

            formThree.parentElement.style.display = "block"
        });
        
        formThree.addEventListener("submit", (e) => {
            e.preventDefault();

            formThreeData = new FormData(formThree);
            scheme.updateSchemeWithFormTwoData(formThreeData);

            if(scheme.leaseType != "finance" && (scheme.deposit > 0 && (scheme.ownership || bundle.outrightCost() > 0))){

                document.getElementById("depositDiv"+numBundles.toString()).innerHTML = scheme.generateDepositForm(numBundles).outerHTML

                let outrightCosts = {}
                Object.assign(outrightCosts, bundle.outright)
                if(scheme.ownership){
                    outrightCosts["Indicative FMV"] = scheme.calculateFMV()
                }else{
                    outrightCosts["Indicative FMV"] = 0;
                }
                outrightCosts["Setup Fee"] = scheme.leaseSetup
                outrightCosts["Initial Silverwing Fee"] = 0.80

                for (const [key, value] of Object.entries(outrightCosts)) {
                    if(value != 0){
                        document.getElementById("deposit" + key + numBundles.toString()).addEventListener("click", (e) =>{
                            e.preventDefault();
                            let spentDeposit = 0
                            if(value < scheme.deposit){
                                scheme.deposit -= value
                                outrightCosts[key] = 0
                                spentDeposit = value
                                if(key == "Indicative FMV"){
                                    scheme.FMVsavings = value
                                }else if(key == "Setup Fee"){
                                    scheme.leaseSetup = 0;
                                }else if(key == "Initial Silverwing Fee"){
                                    scheme.initalSilverwingFeeSaving = 0.8
                                }else{
                                    bundle.outright[key] = 0
                                }
                            }else{
                                outrightCosts[key] -= scheme.deposit
                                if(key == "Indicative FMV"){
                                    scheme.FMVsavings = scheme.deposit
                                }else if(key == "Setup Fee"){
                                    scheme.leaseSetup -= scheme.deposit;
                                }else if(key == "Initial Silverwing Fee"){
                                    scheme.initalSilverwingFeeSaving = scheme.deposit
                                }else{
                                    bundle.outright[key] -= scheme.deposit
                                }
                                spentDeposit = scheme.deposit
                                scheme.deposit = 0
                                
                                for (const [key, value] of Object.entries(outrightCosts)) {
                                    if(value != 0){
                                        document.getElementById("deposit" + key + numBundles.toString()).disabled = true
                                    }
                                }
                                
                            }
                            document.getElementById("deposit" + key + numBundles.toString() + "ExVAT").innerHTML = (outrightCosts[key]).toFixed(2)
                            document.getElementById("deposit" + key + numBundles.toString() + "IncVAT").innerHTML = (outrightCosts[key]*1.2).toFixed(2)
                            document.getElementById("deposit" + key + numBundles.toString() + "left").innerHTML = (spentDeposit).toFixed(2)
                            document.getElementById("leftoverDeposit"+numBundles.toString()).innerHTML = scheme.deposit

                            document.getElementById("deposit" + key + numBundles.toString()).disabled = true;

                            
                        })
                    }
                }
                document.getElementById("submitDeposit"+numBundles.toString()).addEventListener("click", (e) => {
                    e.preventDefault();
        
                    col2.innerHTML = scheme.generatePriceCards(numBundles).outerHTML;
                    submitted[numBundles] = true;
                })
            }else{
                col2.innerHTML = scheme.generatePriceCards(numBundles).outerHTML;
                submitted[numBundles] = true;
            }
              
            
            /*
            let PDF = document.createElement("input");
            PDF.id = "pdfButton"
            PDF.type = "submit";
            PDF.classList.add("btn");
            PDF.classList.add("btn-primary");
            PDF.value = "Generate PDF"
        
        
            col.appendChild(PDF)
            PDF.addEventListener("click", (e) => {
                e.preventDefault();
                scheme.generatePDF(col2);
            });
            */
            // price 1- outright cost = Bundle Cost + school management cost + pool cost + reserve fund + managed service cost + set up fee + silverwing collection fee

        });

       
    });
    globalNumBundles += 1;
    submitted.push(false)
    radiosTwoLock.push(false)
});

function generateDeviceForm(bundleNumber){
    let bundleCard = document.createElement("div");
    let cardTitle = document.createElement("h5");
    let cardBody = document.createElement("div");
    bundleCard.classList.add("card");
    bundleCard.classList.add("text-center")
    bundleCard.classList.add("pt-3")
    bundleCard.appendChild(cardTitle);
    bundleCard.appendChild(cardBody);
        
    cardTitle.classList.add("card-title");
    cardTitle.innerHTML = "Bundle " + (bundleNumber+1).toString();

    cardBody.classList.add("card-text")
    cardBody.action=""
    cardBody.style.margin = "15px"

    cardBody.innerHTML += "<form id=deviceForm" + bundleNumber.toString() + ` class="input-group mb-3">
        <div class="form-floating">
            <input type="text" id="manufacturerField" class="form-control" name="manufacturer" placeholder="Manufacturer.." required>
            <label for="manufacturerField">Manufacturer</label>
        </div>
        <div class="form-floating">
            <input type="text" id="sku" class="form-control" name="SKU" placeholder="SKU..">
            <label for="sku">SKU</label>
        </div>
        <div class="form-floating">
            <input type="number" id="priceField" class="form-control" name="sellPrice" placeholder="Sell Price" step="0.01" required>
            <label for="priceField">price</label>
        </div>
        <input type="submit" class="btn btn-primary" value="Add Device">
    </div></form>`

    return bundleCard;
}