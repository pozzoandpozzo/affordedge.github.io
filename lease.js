class Lease{

    constructor(){

        this.leaseRates = {
            "Monthly":{
                "operating":{
                "private":{
                    "Advance":[40.51, 28.38],
                    "Arrears":[40.83, 28.59]
                },
                "state":{
                    "Advance":[40.51, 28.38],
                    "Arrears":[40.72, 28.48]
                }      
                },
                "finance": {
                    "private":{
                        "Advance":[46.66, 32.47, 25.45, 21.03],
                        "Arrears":[46.91, 32.72, 25.65, 21.19]
                    },
                    "state":{
                        "Advance":[46.66, 32.47, 25.45, 21.03],
                        "Arrears":[46.91, 32.29, 25.65, 21.19]
                    }      
                }
            },
            "Termly":{
                "operating":{
                    "private":{
                        "Advance":[160.40, 112.99],
                        "Arrears":[165.58, 116.55]
                    }   
                },
                "finance": {
                    "private":{
                        "Advance":[184.23, 128.17, 100.45, 83.04],
                        "Arrears":[190.17, 132.20, 103.60, 85.51]
                    } 
                } 
            },
            "Quarterly":{
                "operating":{
                    "state":{
                        "Advance":[120.49, 84.41],
                        "Arrears":[123.33, 87.13]
                    }      
                },
                "finance": {
                    "state":{
                        "Advance":[120.49, 84.41],
                        "Arrears":[123.33, 87.13]
                    }      
                }
            },
            "Annual":{
                "operating":{
                    "state":{
                        "Advance":[464.46, 325.53],
                        "Arrears":[508.25, 358.44]
                    }      
                },
                "finance": {
                    "state":{
                        "Advance":[120.49, 84.41],
                        "Arrears":[123.33, 87.13]
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