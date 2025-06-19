
// const mongoose = require('mongoose');

// const Schema = mongoose.Schema;
// const User = new Schema({
//     name: {
//         type: String
//     },
//     email: {
//         type: String
//     },
//     password: {
//         type: String
//     },
//     assignedTests: {
//         type: Array
//     },
//     completedTests: {
//         type: Array
//     }
// })
// module.exports = mongoose.model('User', User);


const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const User = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    assignedTests: {
        type: Array
    },
    completedTests: {
        type: Array
    },
    isApproved: {
        type: Boolean,
        default: false
    }
})
module.exports = mongoose.model('User', User);
