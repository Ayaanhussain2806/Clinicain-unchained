import React, { useState } from "react";
import { runWorkflow } from "../engine/workflowEngine";

const PrescriptionDashboard = () => {

const [data,setData] = useState({
id:"",
medicine:"",
status:"approved",
reason:""
});

const [result,setResult] = useState(null);

const handleChange = (e) => {
setData({
...data,
[e.target.name]:e.target.value
});
};

const handleSubmit = async () => {

const response = await runWorkflow(data);

setResult(response);
};

return (

<div className="dashboard">

<h2>Clinician AI Workflow Engine</h2>

<input
name="id"
placeholder="Prescription ID"
onChange={handleChange}
/>

<input
name="medicine"
placeholder="Medicine"
onChange={handleChange}
/>

<select name="status" onChange={handleChange}>
<option value="approved">Approved</option>
<option value="rejected">Rejected</option>
</select>

<select name="reason" onChange={handleChange}>
<option value="">Select Reason</option>
<option value="insurance_denial">Insurance Denial</option>
<option value="out_of_stock">Pharmacy Stock Issue</option>
</select>

<button onClick={handleSubmit}>
Run AI Workflow
</button>

{result && (

<pre>
{JSON.stringify(result,null,2)}
</pre>

)}

</div>

);

};

export default PrescriptionDashboard;