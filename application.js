"use strict";

let bundles = [];
let schoolType = "state";
let leaseType = "operating";
let advanceArrears = "Advance";
let numBundles = -1;
let formTwoData = null;
let formThreeData = null;
let submitted = false;

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
    document.getElementById("buttonContainer").style.display = "none";
    //create a new column to put bundle forms in
    let mainFormData = new FormData(document.getElementById("initialForm"));
    let col = document.createElement("div");
    col.classList.add("col");
    // Add device Form card to the column - Manufacturer, SKU and Price
    col.appendChild(generateDeviceForm(numBundles+1));
    col.innerHTML += "<br>"


    // insert column into index.html
    Container.insertBefore(col, Container.lastChild);

    // Event listener for the device form 
    const deviceForm = document.getElementById("deviceForm" + (numBundles+1).toString());
    deviceForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        let formData = new FormData(deviceForm);
        // create bundle from the device information
        let bundle = new Bundle(formData.get("manufacturer") + " "+ formData.get("SKU"), parseFloat(formData.get("sellPrice")));
        bundles.push(bundle)

        // generate next stage of device form with table and soft cost controls
        deviceForm.outerHTML = bundle.generateTable(numBundles) + bundle.generateBundleControls().innerHTML
        

        // create a new row for scheme cards
        let row = document.createElement("div");
        
        let scheme = new Scheme(bundle, mainFormData.get("units"));
        scheme.updateSchemeWithFormData(schoolType)
        // generate new scheme card and add to index
        const schemeCard = scheme.generateForm(numBundles, numBundles, schoolType);
        
    
        //create new column for each field
        col.classList.add("col");
        col.appendChild(row);

        row.classList.add("row");
        row.classList.add("gx-3");
        row.appendChild(schemeCard);
        col.innerHTML += "<br>"

        const col2 =  document.createElement("div");
        col.appendChild(col2);
        // add event listener for form adding new add ons to the bundle
        let bundleForm = document.getElementById("bundleForm" + numBundles.toString());
        let table = document.getElementById("table"+ numBundles.toString());
        const soft = document.getElementById("softCost"+ numBundles.toString());
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
                bundle.addAddOn(formData.get("bundleAddon"), parseFloat(formData.get("Price")))
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

            if(scheme.priceCardsGenerated){
                col2.innerHTML = scheme.generatePriceCards(schoolType, leaseType, advanceArrears, bundles[numBundles]).outerHTML;
            }
            for (const [key, value] of Object.entries(bundle.softCopy)) {
                document.getElementById(key + numBundles.toString()).addEventListener("click", (e) => {
                    e.preventDefault();
                    bundle.removeSoftCost(key)
                    bundle.updateTradeIn()
                    table.innerHTML = bundle.generateTable(numBundles)
                    document.getElementById("recalculatedTable").innerHTML = ""
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

        // fixes the bundle if it goes over 10% by converting soft costs to services until compliant
        let disclaimer = document.getElementById("disclaimer");
        let fixButton = document.getElementById("fixSoftCost");
        fixButton.addEventListener("click", (e) => {
            e.preventDefault();
           

            bundle.updateTradeIn()
            bundle.fixSoftCost()
            document.getElementById("recalculatedTable").innerHTML = bundle.generateRecalculatedTable(numBundles)
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
                col2.innerHTML = scheme.generatePriceCards(schoolType, leaseType, advanceArrears, bundles[numBundles]).outerHTML;
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
        scheme.copyFormDataAcross(formTwoData, formTwo);
        scheme.copyFormDataAcross(formThreeData, formThree);

        if(schoolType == "private"){
            var radiosTwo = formTwo.elements["leaseTypes"];
            for(var i = 0, max = radiosTwo.length; i < max; i++) {
                radiosTwo[i].onclick = function() {
                    leaseType = this.value;
                }
            }
        }
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

            if(submitted){
                col2.innerHTML = scheme.generatePriceCards().outerHTML;
            }

            formThree.parentElement.style.display = "block"
        });
        
        formThree.addEventListener("submit", (e) => {
            e.preventDefault();

            formThreeData = new FormData(formThree);
            scheme.updateSchemeWithFormTwoData(formThreeData);


            document.getElementById("buttonContainer").style.display = "block"

            col2.innerHTML = scheme.generatePriceCards().outerHTML;
            submitted = true;
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
    numBundles += 1;
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

    cardBody.innerHTML += "<form id=deviceForm" + bundleNumber.toString() + ` class="input-group">
        <input type="text" class="form-control" name="manufacturer" placeholder="Manufacturer..">
        <input type="text" class="form-control" name="SKU" placeholder="SKU..">
        <input type="number" class="form-control" name="sellPrice" placeholder="Sell Price" step="0.01">
        <input type="submit" class="btn btn-primary" value="Add Device">
    </div></form>`

    return bundleCard;
}