const fs = require('fs');
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/getBill', (req, res) => {
    var valist = JSON.parse(fs.readFileSync('./valist.json'))
    // find va number from valist json file and return the va number
    let vaNumber = valist.find(va => va.va_number === req.body.GetBillRq.VI_VANUMBER)

    if (vaNumber.status == '1') {
        var response = {
            "GetBillRs":
            {
                "STATUS": "88"
            }
        }

        res.json(response)
    }

    // check if vaNumber found
    if (vaNumber) {
        var response = {
            "GetBillRs":
            {
                "CUSTNAME": "KKS MAHMUD",
                "BILL_AMOUNT": "10000.00",
                "VI_CCY": "360",
                "RefInfo": [
                    {
                        "RefName": "BillPeriod",
                        "RefValue": "02"
                    },
                    {
                        "RefName": "BillLateCharges",
                        "RefValue": "0",
                    }
                ],
                "STATUS": "00"
            }
        }
    
        res.json(response);
    } else {
        var response = {
            "GetBillRs":
                {
                    "CUSTNAME": "",
                    "BILL_AMOUNT": "0",
                    "VI_CCY": "360",
                    "RefInfo": [
                        {
                            "RefName": "BillPeriod",
                            "RefValue": ""
                        },
                        {
                            "RefName": "BillLateCharges",
                            "RefValue": "",
                        }
                    ],
                    "STATUS": "14"
                }
        }
        res.json(response)
    }
})

app.post('/payBill', (req, res) => {
    var valist = JSON.parse(fs.readFileSync('./valist.json'))
    // find va number from valist json file and return the va number
    let vaNumber = valist.find(va => va.va_number === req.body.PayBillRq.VI_VANUMBER)
    // check if vaNumber found
    if (vaNumber && vaNumber.status == '0') {
        // update json file status to 1
        vaNumber.status = '1'
        fs.writeFileSync('./valist.json', JSON.stringify(valist))

        var response = {
            "PayBillRs":
            {
                "STATUS": "00"
            }
        }
    
        res.json(response);
    } else if (vaNumber && vaNumber.status == '1') {
        var response = {
            "PayBillRs":
            {
                "STATUS": "88"
            }
        }

        res.json(response)

    } else {
        var response = {
            "PayBillRs":
            {
                "STATUS": "14"
            }
        }

        res.json(response)
    }
})

app.post('/revBill', (req, res) => {
    var valist = JSON.parse(fs.readFileSync('./valist.json'))
    // find va number from valist json file and return the va number
    let vaNumber = valist.find(va => va.va_number === req.body.RevBillRq.VI_VANUMBER)
    // check if vaNumber found
    if (vaNumber && vaNumber.status == '0') {
        // update json file status to 1
        vaNumber.status = '1'
        fs.writeFileSync('./valist.json', JSON.stringify(valist))

        var response = {
            "RevBillRs":
            {
                "STATUS": "00"
            }
        }
    
        res.json(response);
    } else if (vaNumber && vaNumber.status == '1') {
        var response = {
            "RevBillRs":
            {
                "STATUS": "88"
            }
        }

        res.json(response)
        
    } else {
        var response = {
            "RevBillRs":
            {
                "STATUS": "14"
            }
        }

        res.json(response)
    }
})

app.get('/refreshstatus', (req, res) => {
    var valist = JSON.parse(fs.readFileSync('./valist.json'))
    // update all status from 1 to 0
    valist.forEach(va => {
        va.status = '0'
    }
    )
    fs.writeFileSync('./valist.json', JSON.stringify(valist))
    res.send('status refreshed')
})

app.get('/getresponsefile', (req, res) => {
    var valist = JSON.parse(fs.readFileSync('./valist.json'))
       
    res.send(valist)
})
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

app.listen(process.env.PORT || 5000)