export const callInsuranceAgent = async (prescription) => {

return new Promise((resolve)=>{

setTimeout(()=>{

resolve({

agent:"Insurance Agent",
action:"Prior Authorization Requested",
prescriptionId:prescription.id,
status:"processing"

});

},1500);

});

};

export const callPharmacyAgent = async (prescription) => {

return new Promise((resolve)=>{

setTimeout(()=>{

resolve({

agent:"Pharmacy Agent",
action:"Alternative medicine suggested",
prescriptionId:prescription.id,
status:"resolved"

});

},1500);

});

};