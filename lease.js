class Lease{

    constructor(){

        this.leaseRates = {
            "Monthly":{
                "operating":{
                "private":{
                    "Advance":[40.47, 28.46],
                    "Arrears":[40.78, 28.59]
                },
                "state":{
                    "Advance":[40.35, 28.21],
                    "Arrears":[40.65, 28.41]
                }      
                },
                "finance": {
                    "private":{
                        "Advance":[46.51, 32.31, 25.30, 20.94],
                        "Arrears":[46.75, 32.56, 25.49, 21.09]
                    },
                    "state":{
                        "Advance":[0, 32.09, 25.07, 20.07],
                        "Arrears":[0, 32.32, 25.25, 20.85]
                    }      
                }
            },
            "Termly":{
                "operating":{
                    "private":{
                        "Advance":[159.82, 112.37],
                        "Arrears":[164.80, 115.78]
                    }   
                },
                "finance": {
                    "private":{
                        "Advance":[183.74, 127.64, 99.88, 82.69],
                        "Arrears":[189.46, 131.51, 102.91, 85.09]
                    } 
                } 
            },
            "Quarterly":{
                "operating":{
                    "state":{
                        "Advance":[120.03, 83.93],
                        "Arrears":[122.76, 85.56]
                    }      
                },
                "finance": {
                    "state":{
                        "Advance":[0, 95.51, 74.59, 61.61],
                        "Arrears":[0, 98.31, 76.19, 62.88]
                    }      
                }
            },
            "Annual":{
                "operating":{
                    "state":{
                        "Advance":[463.33, 324.15],
                        "Arrears":[505.45, 355.83]
                    }      
                },
                "finance": {
                    "state":{
                        "Advance":[0, 369.27, 288.04, 238.05],
                        "Arrears":[0, 404.59, 312.78, 257.65]
                    }      
                }
            }
        }
        this.indicativeValue = 18.5;
        this.date = this.currentDate()
    }

    currentDate(){
        // Date object
        const date = new Date();

        let currentDay= String(date.getDate()).padStart(2, '0');

        let currentMonth = String(date.getMonth()+1).padStart(2,"0");

        let currentYear = date.getFullYear();

        // we will display the date as DD-MM-YYYY 

        return `${currentDay}-${currentMonth}-${currentYear}`;

    }
}