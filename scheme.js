"use strict;"

class Scheme {
    
    constructor(bundle, numberOfUnits, length=0, frequency=0, pool=0, reserve=0, serviceManagement=0, setup=0, schoolManagement=0, deposit=0, numberOfCollections=0){
        // case where scheme is manually defined
        this.bundle = bundle;
        this.numberOfUnits = numberOfUnits || 1;
        this.length = length;
        this.frequency = frequency;
        this.pool = pool;
        this.outrightReserve = reserve;
        this.leaseReserve = reserve;
        this.serviceManagement = serviceManagement;
        this.outrightSetup = setup;
        this.leaseSetup = setup;
        this.numberOfCollections = numberOfCollections || this.length*(12/this.frequency);
        this.deposit = deposit;
        this.priceCardsGenerated = false;
        this.serviceFees = 0;
        this.tradeIn = 0;
        this.ownership = false;
        this.lease = null;
        this.FMVsavings = 0
        this.initalSilverwingFeeSaving = 0
    }


    updateSchemeWithFormData(schoolType){
        this.schoolType = schoolType;
        this.leaseType = "operating"
    }

    setLeaseType(leaseType){
        this.leaseType = leaseType
    }
    updateSchemeWithFormOneData(formData, advanceArrears){
        this.length = parseFloat(formData.get("leaseLength"));
        this.frequency = parseFloat(formData.get("frequency"))
        this.pool = parseFloat(formData.get("pool")) || 0;
        this.advanceArrears = advanceArrears;
        this.leaseType = leaseType;
    }

    updateSchemeWithFormTwoData(formData){
        if(formData.get("leaseReserve") == "yes"){
            this.leaseReserve = parseFloat(formData.get("reserve")) || 0;
        }
        if(formData.get("outrightReserve") == "yes"){
            this.outrightReserve = parseFloat(formData.get("reserve")) || 0;
        }
        this.serviceManagement = parseFloat(formData.get("serviceCost")) || 0;
        this.leaseSetup = parseFloat(formData.get("setup")) || 0;
        this.outrightSetup = parseFloat(formData.get("setup")) || 0;
        this.schoolManagement = parseFloat(formData.get("schoolManagementCost")) || 0;
        this.deposit = parseFloat(formData.get("deposit")) || 0; 
        this.originalDeposit = parseFloat(formData.get("deposit")) || 0; 
        this.numberOfCollections = parseFloat(formData.get("collections")) || this.length*(12/this.frequency);;
        this.deposit = parseFloat(formData.get("deposit")) || 0
        this.ownership = (formData.get("ownership") == "yes")
    }

    calculateFMV(){
        return ((this.lease.indicativeValue*this.bundle.hardCost())/100) - this.FMVsavings;
    }

    bundleCost(){
        return this.bundle.totalCost() + this.bundle.serviceCost() + this.bundle.outrightCost();
    }

    calculatePool(){
        return (this.bundleCost() * this.pool)/100;
    }
    
    calculateOutrightReserve(){
        return (this.bundleCost()*this.outrightReserve)/100;
    }

    outrightPrice(){
        return this.bundleCost() + this.calculatePool() + this.calculateOutrightReserve() + this.serviceManagement + this.outrightSetup
    }

    silverwingFee(){
        return (((0.01*this.outrightPrice())+0.5)/0.99) + 0.8;
    }

    finalPrice(){
        return this.outrightPrice() + this.silverwingFee();
    }

    paymentTiming(){
        let timings = {1:"Monthly", 3:"Quarterly", 4:"Termly", 12:"Annual"};
        return timings[this.frequency];
    }


    leaseRate(){
        return this.lease.leaseRates[this.paymentTiming()][this.leaseType][this.schoolType][this.advanceArrears][this.length-2]/1000
    }

    serviceRate(){
        if(this.schoolType == "state" && this.length == 2){
            return this.lease.leaseRates["Monthly"]["finance"]["private"][advanceArrears][this.length-2]/1000
        }else{
            return this.lease.leaseRates[this.paymentTiming()]["finance"][schoolType][advanceArrears][this.length-2]/1000
        }
    }
    
    leaseCost(){
        return (this.leaseRate() * this.bundle.totalCost())
    }

    serviceCost(){
        return (this.serviceRate() * this.bundle.serviceCost())
    }

    calculateLeasePool(){
        if(this.serviceTiming() == this.paymentTiming()){
            return ((this.leaseCost()+this.serviceCost()) * this.pool)/100
        }
        return (this.leaseCost() * this.pool)/100 + (this.serviceCost()*this.frequency*this.pool)/100
    }

    calculateLeaseReserve(){
        return ((this.leaseCost()+this.serviceCost()) * this.leaseReserve)/100 
    }

    totalCost(){
        if(this.serviceTiming() == this.paymentTiming()){
            return this.leaseCost() + this.serviceCost() + this.calculateLeasePool() + this.calculateLeaseReserve() + this.serviceManagement
        }else{
            return this.leaseCost() + this.calculateLeasePool() + this.calculateLeaseReserve() + this.serviceManagement - (this.calculateFMV()/((12/this.frequency)*this.length))
        }
    }
    leaseSilverwingFee(){
        return (((0.01*(this.totalCost()))+0.5)/0.99);
    }
    
    finalLeasePrice(){
        if(this.serviceTiming() == this.paymentTiming()){
            return this.totalCost() + this.leaseSilverwingFee()
        }else{
            return this.totalCost() + this.leaseSilverwingFee() + this.serviceCost()*this.frequency
        }
    }

    serviceTiming(){
        if(this.schoolType == "state" && this.length == 2){
            return "Monthly"
        }else{
            return this.paymentTiming()
        }   
    }

    collectionMultiplier(){
        return ((12/this.frequency)*this.length)/this.numberOfCollections
    }

    generateForm(numBundles){
        const container = document.createElement("div")
        const cardOne = document.createElement("div");
        const cardTwo = document.createElement("div");
        const cardTitleOne = document.createElement("h5");
        const cardBodyOne = document.createElement("form")
        const cardTitleTwo = document.createElement("h5");
        const cardBodyTwo = document.createElement("form")


        cardTitleOne.style.textAlign = "center"
        cardTitleTwo.style.textAlign = "center"


        cardOne.classList.add("card");
        cardOne.classList.add("pt-3")
        cardOne.appendChild(cardTitleOne);
        cardOne.appendChild(cardBodyOne);


        cardTitleOne.classList.add("card-title");
        cardTitleOne.innerHTML = "Lease Options"
        cardBodyOne.classList.add("card-text")
        cardBodyOne.classList.add("card-text");
        cardBodyOne.id = "formTwo" + numBundles.toString()
        cardBodyOne.style.margin = "15px"
        cardBodyOne.action=""



        //HTML for form
        cardBodyOne.innerHTML = "<h6>Lease Type:</h6>"
        cardBodyOne.innerHTML += 
        `<div class="mb-3" id="AdvanceArrearsForm">
            <input type="radio" class="btn-check" name="advanceArrears" id="advanceOption` + numBundles.toString() + `" autocomplete="off" value="Advance" checked>
            <label class="btn btn-outline-primary" for="advanceOption` + numBundles.toString() + `">Advance</label>
            <input type="radio" class="btn-check" name="advanceArrears" id="arrearsOption` + numBundles.toString() + `" autocomplete="off" value="Arrears">
            <label class="btn btn-outline-primary" for="arrearsOption` + numBundles.toString() + `">Arrears</label></div>`

            cardBodyOne.innerHTML +=  `<select id="leaseLengthSelect`+numBundles.toString() + `" name="leaseLength" class="form-select mb-3" required>
                <option value="" disabled selected hidden>Lease length</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
            </select>`

        if(this.schoolType == "private"){
            cardBodyOne.innerHTML += `<select name="frequency" class="form-select mb-3" required>
                <option value="" disabled selected hidden>Payment Frequency</option>
                <option value="1">Monthly</option>
                <option value="4">Termly</option>
            </select>`
        }else{
            cardBodyOne.innerHTML += `<select name="frequency" class="form-select mb-3" required>
                <option value="" disabled selected hidden>Payment Frequency</option>
                <option value="1">Monthly</option>
                <option value="3">Quarterly</option>
                <option value="12">Annually</option>
            </select>`
        }
            cardBodyOne.innerHTML += `<div class="input-group mb-3 flex-nowrap"">
                <div class="form-floating">
                    <input name="pool" id="poolField" type="number" class="form-control" placeholder="Pool" step="0.01">
                    <label for="poolField">Pool</label>
                </div>
                <span class="input-group-text">%</span>
            </div>
            <div class="actions text-center">
                <input type="submit" class="btn btn-primary" value="Submit">
            </div>`
        container.appendChild(cardOne)
        container.innerHTML += "<br>"

        cardBodyTwo.id = "formThree" + numBundles.toString()

        cardTwo.classList.add("card");
        cardTwo.classList.add("pt-3")
        cardTwo.appendChild(cardTitleTwo);
        cardTwo.appendChild(cardBodyTwo);
        cardTwo.style.display = "None"
            
        cardTitleTwo.classList.add("card-title");
        cardTitleTwo.innerHTML = "1:1 Contribution Options"
        cardBodyTwo.classList.add("card-text")
        cardBodyTwo.style.margin = "15px";
        cardBodyTwo.action=""

        let html = `<div class="input-group mb-3 flex-nowrap">
        <div class="form-floating">
            <input id="reserveField" name="reserve" type="number" class="form-control" placeholder="reserve fund" step="0.01">
            <label for="reserveField">Reserve Fund</label>
        </div>
        <span class="input-group-text">%</span>
        </div>
        <div class="input-group mb-3 flex-nowrap">
            <label class="mb-3" style="padding-right: 15px;"><b>Apply Reserve Fund To:</b>
            <div class="form-check" style="padding-right: 15px;">
                <input class="form-check-input" type="checkbox" value="yes" id="outrightReserveFund`+numBundles.toString() +`" name="outrightReserve">
                <label class="form-check-label" for="outrightReserveFund`+numBundles.toString()+`">
                    Outright
                </label>
                
            </div>
            <div class="form-check" style=" padding-right: 15px;">
                <input class="form-check-input" type="checkbox" value="yes" id="leaseReserveFund`+numBundles.toString()+`" name="leaseReserve">
                <label class="form-check-label" for="leaseReserveFund`+numBundles.toString()+`">
                    Repeat Payments
                </label>
            </div>
            </label>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text">£</span>
            <div class="form-floating">
                <input id="serviceCostField" name="serviceCost" type="number" class="form-control" placeholder="Managed Service Cost.." step="0.01">
                <label for="serviceCostField">Managed Service Cost</label>
            </div>
        </div>
        <div class="input-group mb-3 flex-nowrap">
            <span class="input-group-text">£</span>
            <div class="form-floating">
                <input id="setupField" name="setup" type="number" class="form-control" placeholder="Set up fee.." step="0.01">
                <label for="setupField">Set up fee</label>
            </div>
        </div>
        <div class="input-group mb-3 flex-nowrap">
            <div class="form-floating">
                <input id="collectionField" name="collections" type="number" class="form-control" placeholder="Number of Collections.." step="1">
                <label for="collectionField">Number of Collections</label>
            </div>
        </div> 
        <div class="input-group mb-3 flex-nowrap">
            <span class="input-group-text">£</span>
            <div class="form-floating">
                <input id="depositField" name="deposit" type="number" class="form-control" placeholder="Deposit.." step="0.01">
                <label for="depositField">Deposit</label>
            </div>
        </div>`

        if(this.leaseType != "finance"){
            html += `<div class="form-check">
                <input class="form-check-input" type="checkbox" value="yes" id="flexCheckDefault`+numBundles.toString()+`" name="ownership">
                <label class="form-check-label" for="flexCheckDefault`+numBundles.toString()+`">Parent ownership at end of lease?</label>
            </div>`
        }

        html += `<div class="actions text-center">
            <input type="submit" class="btn btn-primary" value="Submit">
            </div>`
        
        cardBodyTwo.innerHTML = html
        container.appendChild(cardTwo)
        container.innerHTML += "<br>"

        return container;
    }

    
    generateDepositForm(numBundles){
        let card = document.createElement("div")
        let cardTitle = document.createElement("h5");
        let cardBody = document.createElement("div")

        card.classList.add("card");
        card.classList.add("pt-3")
        card.classList.add("text-center")
        card.appendChild(cardTitle);
        card.appendChild(cardBody);

        cardTitle.classList.add("card-title");
        cardTitle.innerHTML = "Deposit Overview"

        cardBody.classList.add("card-text")
        cardBody.style.margin = "15px"
        cardBody.action=""

        let html = `<table class="table">
        <thead>
        <tr>
            <th>
            <b>Charge</b>
            </th>
            <th>
            <b>Ex VAT</b>
            </th>
            <th>
            <b>Inc VAT</b>
            </th>
            <th>
            <b>Deposit Spent</b>
            </th>
            <th></th>
        </tr>
        </thead>`
    
        for (const [key, value] of Object.entries(this.bundle.outright)) {
            html += `<tr>
                <td>`+ key+
                `</td>
                <td>£<span id="deposit`+key+numBundles.toString()+ `ExVAT">` + (value).toFixed(2) +`</span></td>
                <td>£<span id="deposit`+key+numBundles.toString()+`IncVAT">` + (value*1.2).toFixed(2) +`</span></td>
                <td style="color: green">£<span id="deposit`+key+numBundles.toString() + `left">0</span></td>
                <td>
                <button type="button" id="deposit`+key+numBundles.toString() +`" class="btn btn-light"><svg style="color: #2979FF" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg></button>
                </td>
            </tr>`
        }

        if(this.ownership){
           html += `<tr>
           <td>Indicative FMV</td>
           <td>£<span id="depositIndicative FMV`+numBundles.toString() +`ExVAT">` + (this.calculateFMV()).toFixed(2) +`</span></td>
           <td>£<span id="depositIndicative FMV`+numBundles.toString() +`IncVAT">` + (this.calculateFMV()*1.2).toFixed(2) +`</span></td>
           <td style="color: green">£<span id="depositIndicative FMV`+numBundles.toString() +`left">0</span></td>
           <td>
           <button type="button" id="depositIndicative FMV`+numBundles.toString() +`" class="btn btn-light"><svg style="color: #2979FF" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
           <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
           <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg></button>
           </td>
           </tr>`
        }

        if(this.leaseSetup != 0){
           html += `<tr>
           <td>Setup Fee</td>
           <td>£<span id="depositSetup Fee`+numBundles.toString() +`ExVAT">` + (this.leaseSetup).toFixed(2) +`</span></td>
           <td>£<span id="depositSetup Fee`+numBundles.toString() +`IncVAT">` + (this.leaseSetup*1.2).toFixed(2) +`</span></td>
           <td style="color: green">£<span id="depositSetup Fee`+numBundles.toString() +`left">0</span></td>
           <td>
           <button type="button" id="depositSetup Fee`+numBundles.toString() +`" class="btn btn-light"><svg style="color: #2979FF" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
           <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
           <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg></button>
           </td>
           </tr>`
        }

        html += `<tr>
                <td>Initial Silverwing Fee</td>
                <td>£<span id="depositInitial Silverwing Fee`+numBundles.toString() +`ExVAT">`+ (0.8 - this.initalSilverwingFeeSaving).toFixed(2) + `</span></td>
                <td>£<span id="depositInitial Silverwing Fee`+numBundles.toString() +`IncVAT">`+ ((0.8 - this.initalSilverwingFeeSaving)*1.2).toFixed(2) + `</span></td>
                <td style="color: green">£<span id="depositInitial Silverwing Fee`+numBundles.toString() +`left">0</span></td>
                <td>
                <button type="button" id="depositInitial Silverwing Fee`+numBundles.toString() +`" class="btn btn-light"><svg style="color: #2979FF" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg></button>
                </td>
                </tr></table>`


                
        if(this.deposit != 0){
            html += `<h6 style="color: green">Deposit leftover: £<span id="leftoverDeposit`+numBundles.toString()+`">`+ this.deposit + `</span></h6>`
        }
        html += `<div class="actions text-center">
            <input id="submitDeposit`+numBundles.toString() +`"type="submit" class="btn btn-primary" value="Submit">
            </div>`

        cardBody.innerHTML = html;
        return card
    }

    copyFormDataAcross(formData, newForm){
        if(formData != null){
            for(let i = 0; i < newForm.elements.length-1; i++){
                if(newForm.elements[i].type == "radio"){
                    newForm.elements[i].checked = (formData.get(newForm.elements[i].name) != null)
                }else if(newForm.elements[i].type == "checkbox"){
                    newForm.elements[i].checked = (formData.get(newForm.elements[i].name) == "yes")
                }else{
                    newForm.elements[i].value = formData.get(newForm.elements[i].name)
                }
            }
        }
    }
    generatePriceCards(numBundles){
        this.priceCardsGenerated = true;
        const container = document.createElement("div")
        let rows = [document.createElement("div"), document.createElement("div"), document.createElement("div")];
        rows[0].classList.add("row");
        rows[0].classList.add("gx-3");
        rows[1].classList.add("row");
        rows[1].classList.add("gx-3");
        rows[2].classList.add("row");
        rows[2].classList.add("gx-3");


        container.appendChild(rows[1])
        container.appendChild(rows[0])
        container.appendChild(rows[2])
        // calculate all numbers 
    
        
        let leaseString = ""
        if(leaseType == "operating"){
            leaseString = "Operating Lease";
        }else{
            leaseString = "Finance Lease"
        }

        //outright summary
        const outrightCol = document.createElement("div");
        const outrightCard = document.createElement("div");
        outrightCard.classList.add("card")
        outrightCard.classList.add("mb-4")
        outrightCard.classList.add("box-shadow")

        outrightCol.classList.add("col")

        rows[1].appendChild(outrightCol)

        outrightCard.innerHTML = `<div class="card-header">
            <h4 class="my-0 font-weight-normal">Outright Payment</h4>
        </div>
        <div class="card-body">
            <h1 class="card-title pricing-card-title">£`+ this.finalPrice().toFixed(2) +` <small class="text-muted">parental cost</small></h1>
            <ul class="list-unstyled mt-3 mb-4">
            <li>One Off Payment</li>
            <li>Excluding VAT</li>
            <li style="color: green">Trade in saving per unit: £`+ (this.bundle.tradeIn * (1-this.bundle.tradeInProportion)).toFixed(2) +`</li>
            </ul>
            <button class="btn btn-lg btn-block btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#outrightOverview`+numBundles.toString()+`" data-parent=".multi-collapse" aria-expanded="false" aria-controls="collapseExample">
                See Breakdown
            </button>
        </div>`

        outrightCol.appendChild(outrightCard)

        //lease summary

        const leaseCol = document.createElement("div");
        const leaseCard = document.createElement("div");
        leaseCard.classList.add("card")
        leaseCard.classList.add("mb-4")
        leaseCard.classList.add("box-shadow")

        leaseCol.classList.add("col")
        rows[1].appendChild(leaseCol)

        leaseCard.innerHTML =  `<div class="card-header">
                <h4 class="my-0 font-weight-normal">Repeat Payment</h4>
            </div>
            <div class="card-body">
                <h1 class="card-title pricing-card-title">£`+ (this.finalLeasePrice()*this.collectionMultiplier()).toFixed(2) + ` <small class="text-muted">/ collection</small></h1>
                <ul class="list-unstyled mt-3 mb-4">
                <li>This is a `+ this.length.toString() + ` year ` + this.leaseType + ` lease</li>
                <li>Excluding VAT</li>
                <li style="color: green">Trade in saving per collection: £`+ (this.bundle.tradeIn * (1-this.bundle.tradeInProportion) * this.leaseRate() * this.collectionMultiplier()).toFixed(2) +`</li>
                </ul>
                <button class="btn btn-lg btn-block btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#leaseOverview`+numBundles.toString()+`" data-parent=".multi-collapse" aria-expanded="false" aria-controls="collapseExample">
                    See Breakdown
                </button>
            </div>`

            leaseCol.appendChild(leaseCard)



        // OVERVIEW CARD
        const overviewCol = document.createElement("div");
        rows[0].appendChild(overviewCol);
        const overviewCard = document.createElement("div");
        let cardTitle = document.createElement("h6");
        let cardBody = document.createElement("p");

        cardTitle.classList.add("card-title")
        cardBody.classList.add("card-text")
        cardBody.style.margin = "15px";

        overviewCol.classList.add("collapse")
        overviewCol.appendChild(overviewCard)
        overviewCol.id = "outrightOverview" + numBundles.toString()

        overviewCard.classList.add("card");
        overviewCard.classList.add("text-center")
        overviewCard.classList.add("pt-3")
        overviewCard.appendChild(cardTitle);
        overviewCard.appendChild(cardBody);
            
        cardTitle.innerHTML = "Overview";

        let table =  `<table class="table">
            <thead>
            <tr>
                <th>
                   <b>Charge</b>
                </th>
                <th>
                    Supplier
                </th>
                <th>
                   <b>Ex VAT</b>
                </th>
                <th>
                   <b>Inc VAT</b>
                </th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>` + this.bundle.deviceName +
            `</td>
            <td>
            Supplier
            </td>
            <td>£`+ this.bundle.hard[this.bundle.deviceName].toFixed(2) +
            `</td>
            <td>£`+ (this.bundle.hard[this.bundle.deviceName]*1.2).toFixed(2) +
            `</td>
         </tr>`
    
            for (const [key, value] of Object.entries(this.bundle.soft)) {
                if(value != 0){
                    table += `<tr>
                        <td>`+ key+
                        `</td>
                        <td>
                        Supplier
                        </td>
                        <td>£`+value.toFixed(2)+`</td>
                        <td>£`+(value*1.2).toFixed(2)+`</td>
                    </tr>`
                }
            }

            for (const [key, value] of Object.entries(this.bundle.service)) {
                table += `<tr>
                    <td>`+ key+
                    `</td>
                    <td>
                    Supplier
                    </td>
                    <td>£`+value.toFixed(2)+`</td>
                    <td>£`+(value*1.2).toFixed(2)+`</td>
                </tr>`
            }

            for (const [key, value] of Object.entries(this.bundle.outright)) {
                table += `<tr>
                    <td>`+ key+
                    `</td>
                    <td>
                    Supplier
                    </td>
                    <td>£`+value.toFixed(2)+`</td>
                    <td>£`+(value*1.2).toFixed(2)+`</td>
                </tr>`
            }
            if(this.calculatePool() != 0){
                table += `<tr>
                    <td>
                        Pool
                    </td>
                    <td>
                        Supplier
                    </td>
                    <td>£`+ this.calculatePool().toFixed(2) +
                    `</td>
                    <td>£`+ (this.calculatePool()*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }

            table +=
            `<tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Total Cost To School</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.bundleCost() + this.calculatePool()).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ ((this.bundleCost() + this.calculatePool())*1.2).toFixed(2) +
                `</b></td>
            </tr>`

            if(this.calculateOutrightReserve() != 0){
                table += `<tr>
                <td>
                    Reserve Fund
                </td>
                <td>
                    School
                </td>
                <td>£`+ (this.calculateOutrightReserve()).toFixed(2) +
                `</td>
                <td>£`+ (this.calculateOutrightReserve()*1.2).toFixed(2) +
                `</td>
            </tr>`
            }

            if(this.serviceManagement != 0){
                table += `<tr>
                <td>
                    Managed Service Cost
                </td>
                <td>
                    Supplier
                </td>
                <td>£`+ (this.serviceManagement).toFixed(2) +
                `</td>
                <td>£`+(this.serviceManagement*1.2).toFixed(2) +
                `</td>
            </tr>`
            }

            if(this.outrightSetup != 0){
                table += `<tr>
                <td>
                    Set Up Fee
                </td>
                <td>
                    Supplier
                </td>
                <td>£`+ (this.outrightSetup).toFixed(2) +
                `</td>
                <td>£`+(this.outrightSetup*1.2).toFixed(2) +
                `</td>
            </tr>`
            }
            table += `<tr>
                <td>
                    Silverwing Collection Charge
                </td>
                <td>
                    Silverwing
                </td>
                <td>£`+ (this.silverwingFee()).toFixed(2) +
                `</td>
                <td>£`+(this.silverwingFee()*1.2).toFixed(2) +
                `</td>
            </tr>
            <tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Total Cost To Parent</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.finalPrice()).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+(this.finalPrice()*1.2).toFixed(2) +
                `</b></td>
            </tr>
            </tbody>
            </table>`

        cardBody.innerHTML = table;

        //leaseOverview
        const leaseOverviewCol = document.createElement("div");
        rows[0].appendChild(leaseOverviewCol);
        const leaseOverviewCard = document.createElement("div");
        cardTitle = document.createElement("h6");
        cardBody = document.createElement("p");

        cardTitle.classList.add("card-title")
        cardBody.classList.add("card-text")
        cardBody.style.margin = "15px";

        leaseOverviewCol.classList.add("collapse")
        leaseOverviewCol.appendChild(leaseOverviewCard)
        leaseOverviewCol.id = "leaseOverview" + numBundles.toString()


        leaseOverviewCard.classList.add("card");
        leaseOverviewCard.classList.add("text-center")
        leaseOverviewCard.classList.add("pt-3")
        leaseOverviewCard.appendChild(cardTitle);
        leaseOverviewCard.appendChild(cardBody);
            
        cardTitle.innerHTML = "Overview";

        table =  `<table class="table">
            <thead>
            <tr>
                <th>
                   <b>Charge</b>
                </th>
                <th>
                    Supplier
                </th>
                <th>
                    Charge Type
                </th>
                <th>
                   <b>Ex VAT</b>
                </th>
                <th>
                   <b>Inc VAT</b>
                </th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>` + this.bundle.deviceName +
            `</td>
            <td>
                Supplier
            </td>
            <td>
                Fixed
            </td>
            <td>£`+ (this.bundle.hard[this.bundle.deviceName]*this.leaseRate()).toFixed(2) +
            `</td>
            <td>£`+ (this.bundle.hard[this.bundle.deviceName]*this.leaseRate()*1.2).toFixed(2) +
            `</td>
            </tr>`

            for (const [key, value] of Object.entries(this.bundle.soft)) {
                if(value > 0){
                    table += `<tr>
                        <td>`+ key+
                            `</td>
                        <td>
                            Supplier
                        </td>
                        <td>
                            Fixed
                        </td>
                        <td>£` + (value*this.leaseRate()).toFixed(2) +`</td>
                        <td>£` + (value*this.leaseRate()*1.2).toFixed(2) +`</td>
                    </tr>`
                }
            }

            if(this.paymentTiming() != this.serviceTiming() & this.bundle.serviceCost() != 0){
                for (const [key, value] of Object.entries(this.bundle.service)) {
                    table += `<tr>
                        <td>`+ key+
                        ` (Service, <b>paid monthly</b>)</td>
                        <td>
                           Supplier
                        </td>
                        <td>
                            Fixed
                        </td>
                        <td>£` + (value*this.serviceRate()).toFixed(2) +`</td>
                        <td>£` + (value*this.serviceRate()*1.2).toFixed(2) +`</td>
                    </tr>`
                }
            }else{
                for (const [key, value] of Object.entries(this.bundle.service)) {
                    table += `<tr>
                        <td>`+ key+
                        ` (Service)</td>
                        <td>
                            Supplier
                        </td>
                        <td>
                            Fixed
                        </td>
                        <td>£` + (value*this.serviceRate()).toFixed(2) +`</td>
                        <td>£` + (value*this.serviceRate()*1.2).toFixed(2) +`</td>
                    </tr>`
                }
            }
        
            if(this.bundle.outrightCost() != 0){
                table += `<tr>
                <td>Outright</td>
                <td>
                    Supplier
                </td>
                <td>
                    Fixed
                </td>
                <td>£` + this.bundle.outrightCost().toFixed(2) +`</td>
                <td>£` + (this.bundle.outrightCost()*1.2).toFixed(2) +`</td>
            </tr>`
            }

            if(this.calculateLeasePool() != 0){
                table += `<tr>
                    <td>
                        Pool
                    </td>
                    <td>
                        Siemens/Supplier
                    </td>
                    <td>
                        Fixed
                    </td>
                    <td>£`+ (this.calculateLeasePool()).toFixed(2) +
                    `</td>
                    <td>£`+(this.calculateLeasePool()*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }


            if(this.serviceManagement != 0){
                table += `<tr>
                    <td>
                        Managed Service Cost
                    </td>
                    <td>
                       Supplier
                    </td>
                    <td>
                        Contingent
                    </td>
                    <td>£`+ (this.serviceManagement).toFixed(2) +
                    `</td>
                    <td>£`+(this.serviceManagement*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }

            table += `<tr>
            <td>
                Silverwing Collection Charge
            </td>
            <td>
                Silverwing
            </td>
            <td>
                Fixed
            </td>
            <td>£`+ (this.leaseSilverwingFee()).toFixed(2) +
            `</td>
            <td>£`+(this.leaseSilverwingFee()*1.2).toFixed(2) +
            `</td>
            </tr>`

            if(this.paymentTiming() == this.serviceTiming()){
                table += `<tr>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        <b>`+ this.paymentTiming() + ` cost To School</b>
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.leaseCost() + this.serviceCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee()).toFixed(2) +
                    `</b></td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ ((this.leaseCost() + this.serviceCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee())*1.2).toFixed(2) +
                    `</b></td>
                </tr>`
            }else{
                table += `
                    <tr>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                            <b>`+ this.serviceTiming() + ` cost To School</b>
                        </td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                            -
                        </td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                            -
                        </td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.serviceCost()).toFixed(2) +
                        `</b></td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.serviceCost()*1.2).toFixed(2) +
                        `</b></td>
                    </tr>
                    <tr>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        <b>`+ this.paymentTiming() + ` cost To School</b>
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.leaseCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee()).toFixed(2) +
                    `</b></td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ ((this.leaseCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee())*1.2).toFixed(2) +
                    `</b></td>
                </tr>`
            }
            if(this.calculateLeaseReserve() != 0){
                table += `<tr>
                    <td>
                        Reserve Fund
                    </td>
                    <td>
                        School
                    </td>
                    <td>
                        -
                    </td>
                    <td>£`+ (this.calculateLeaseReserve()).toFixed(2) +
                    `</td>
                    <td>£`+(this.calculateLeaseReserve()*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }
            

    
            if(this.calculateFMV() > 0 && this.ownership && this.leaseType != "finance"){
                table += `<tr>
                <td>Ownership Uplift</td>
                <td>
                    School
                </td>
                <td>
                    -
                </td>
                <td>£` + ((this.calculateFMV())/((12/this.frequency)*this.length)).toFixed(2) +`</td>
                <td>£` +  ((this.calculateFMV()*1.2)/((12/this.frequency)*this.length)).toFixed(2) +`</td>
                </tr>`
            }
            table += `<tr>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        <b>` + this.paymentTiming() + ` cost to parent</b>
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.finalLeasePrice()).toFixed(2) +
                    `</b></td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+(this.finalLeasePrice()*1.2).toFixed(2) +
                    `</b></td>
                </tr>`
            if(this.numberOfCollections != (this.length*12)/this.frequency){
                table +=  `<tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Cost to parent per collection (over ` + this.numberOfCollections.toString() + ` collections)</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.finalLeasePrice()*this.collectionMultiplier()).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+(this.finalLeasePrice()*this.collectionMultiplier()*1.2).toFixed(2) +
                `</b></td>
            </tr>`
            }

        if(this.deposit != 0){
            table += `<tr>
                <td>Deposit</td>
                <td>
                    School
                </td>
                <td>
                   Outright
                </td>
                <td>£` + (this.originalDeposit).toFixed(2) +`</td>
                <td>£` + (this.originalDeposit*1.2).toFixed(2) +`</td>
                </tr>`
        }
        for (const [key, value] of Object.entries(this.bundle.outright)) {
            table += `<tr>
                <td>`+ key+
                `</td>
                <td>
                    Supplier
                </td>
                <td>
                    Outright
                </td>
                <td>£` + (value).toFixed(2) +`</td>
                <td>£` + (value*1.2).toFixed(2) +`</td>
            </tr>`
        }

        if(this.leaseSetup != 0){
            table += `<tr>
            <td>
                Set Up Fee
            </td>
            <td>
                Supplier
            </td>
            <td>£`+ (this.leaseSetup).toFixed(2) +
            `</td>
            <td>£`+(this.leaseSetup*1.2).toFixed(2) +
            `</td>
        </tr>`
        }
        table +=` <tr><td>Initial Silverwing Fee</td>
                <td>
                    Silverwing
                </td>
                <td>
                Outright
                </td>
                <td>£`+ (0.8 - this.initalSilverwingFeeSaving).toFixed(2) + `</td>
                <td>£`+ ((0.8 - this.initalSilverwingFeeSaving)*1.2).toFixed(2) + `</td>
                </tr>
                <tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Initial Cost to Parent</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.bundle.outrightCost()+this.deposit+0.8).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+((this.bundle.outrightCost()+ this.deposit+0.8)*1.2).toFixed(2) +
                `</b></td>
                </tr>`
            
        table += `</tbody>
        </table>`

        let disclaimer = "<p>Lease rates are subject to credit and variaible until drawdown. Lease rates are based on a pre-inception variable, on " + this.lease.date+ ".</p>"


        cardBody.innerHTML = table + disclaimer;

    rows[0].outerHTML += "<br>"
    rows[1].outerHTML += "<br>"
 
    /*const netCard = document.createElement("div")
    const netCardTitle = document.createElement("div")
    const netCardBody = document.createElement("p")
    netCard.classList.add("card")
    netCard.classList.add("text-center")
    netCard.classList.add("pt-3")

    netCardTitle.classList.add("card-title")
    netCardTitle.classList.add("card-text")

    netCard.appendChild(netCardTitle);
    netCard.appendChild(netCardBody);

    netCardTitle.innerHTML = "Total Cost To School Over All Units"
    netCardBody.innerHTML = `<table class="table">
    <thead>
        <tr>
            <th>
            <b>Charge</b>
            </th>
            <th>
            <b>Ex VAT</b>
            </th>
            <th>
            <b>Inc VAT</b>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                Total School Cost
            </td>
            <td>£`+ ((this.finalPrice())*this.numberOfCollections*this.numberOfUnits*(100+this.pool)/100).toFixed(2) +
                `</td>
                <td>£`+(this.finalPrice()*this.numberOfCollections*this.numberOfUnits*((100+this.pool)/100)*1.2).toFixed(2) +
                `</td>
        </tr>
        <tr>
            <td>
            Trade In Saving
            </td>
            <td style="color: green">-£`+ (this.bundle.tradeIn*this.numberOfUnits*(100+this.pool)/100).toFixed(2) +
            `</td>
            <td style="color: green">-£`+(this.bundle.tradeIn*this.numberOfUnits*1.2*(100+this.pool)/100).toFixed(2) +
            `</td>
        </tr>   
    </tr>`

    rows[2].appendChild(netCard) */
    return container;
}

    generatePDF(element) {
        let pdf = window.jspdf;
        let header = new Image();
        header.src = "EDGEheader.png"
        let footer = new Image()
        footer.src = "EDGEfooter.png"

        
        const doc = new pdf.jsPDF('p', 'pt', [595.28,  841.89]);
        const numPages = 1;
        doc.html(element, {
            callback: function (doc) {
              doc.addImage(header, 'png', 0, 0, 595.28, 250)
              doc.addImage(footer, 'png', 0, 790, 595.28, 50)
              let pageCount = doc.internal.getNumberOfPages();
              const initialCount = pageCount
              for(let i = 0; i < initialCount-numPages; i++){
                doc.deletePage(pageCount)
                pageCount = doc.internal.getNumberOfPages();
              }
              doc.save("quote.pdf");
            },
            margin: [10, 10, 10, 10],
            x: 92.64,
            y: 255,
            width: 400, //target width in the PDF document
            windowWidth: 675 //window width in CSS pixels
         });
    }
}