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

app.post('/inquiry', (req, res) => {
    var valist = JSON.parse(fs.readFileSync('./valist.json'))

    // find va number from valist json file and return the va number
    let vaNumber = valist.find(va => va.va_number === req.body.vaNo)

    // check if vaNumber found
    if (vaNumber && vaNumber.status == '0') {
        var response = {
            "inquiryVAResponse": {
                "responseCode": "00",
                "responseMessage": "Approve or completed successfully",
                "detailResponse": {
                "vaName": vaNumber.name,
                "billingAmount": vaNumber.amount,
                "currency": "IDR",
                "reference": vaNumber.reference
                }
                }
        }
    
        res.json(response,200);
    } else if (!vaNumber) {
        var response = {
            "inquiryVAResponse": {
                "responseCode": "14",
                "responseMessage": "Record Specified was not found in the database"
            }
        }
        res.json(response,422);
    }


    if (vaNumber.status == '1') {
        var response = {
            "inquiryVAResponse": {
                "responseCode": "88",
                "responseMessage": "Bill already paid"
            }
        }

        res.json(response,422)
    }
})

app.post('/payment', (req, res) => {
    var valist = JSON.parse(fs.readFileSync('./valist.json'))

    // find va number from valist json file and return the va number
    let vaNumber = valist.find(va => va.va_number === req.body.vaNo)

    if (!vaNumber) {
        var response = {
            "inquiryVAResponse": {
                "responseCode": "14",
                "responseMessage": "Record Specified was not found in the database"
            }
        }
        res.json(response,422);

    }
    // check if vaNumber found
    if  (vaNumber && vaNumber.scenario == '1' && vaNumber.amount == req.body.amount && vaNumber.status == '0') {
        // update json file status to 1
        vaNumber.status = '1'
        fs.writeFileSync('./valist.json', JSON.stringify(valist))

        var response = {
            "paymentVAResponse": {
                "responseCode": "00",
                "responseMessage": "Approve or completed successfully"
            }
        }
    
        res.json(response,200);
    } else if (vaNumber && vaNumber.scenario == '1' && vaNumber.amount !== req.body.amount && vaNumber.status == '0') {
        var response = {
            "paymentVAResponse": {
                "responseCode": "13",
                "responseMessage": "Invalid Amount"
            }
        }

        res.json(response,422)

    } else if (vaNumber && vaNumber.scenario == '1' && vaNumber.status == '1'){
        var response = {
            "paymentVAResponse": {
                "responseCode": "88",
                "responseMessage": "Bill already paid"
            }
        }

        res.json(response,422)
    } else if (vaNumber && vaNumber.scenario == '0' && vaNumber.status == '0') {
        var response = {
            "paymentVAResponse": {
                "responseCode": "00",
                "responseMessage": "Approve or completed successfully"
            }
        }

        res.json(response,200)

    } else {
        var response = {
            "paymentVAResponse": {
                "responseCode": "88",
                "responseMessage": "Bill already paid"
            }
        }

        res.json(response,422)

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