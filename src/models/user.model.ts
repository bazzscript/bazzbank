// Define User Model For Sequelize
// Language: typescript
// Path: src\models\user.model.ts

import Sequelize from 'sequelize';
import sequelize from '../configs/database.config';
import Wallet from './wallet.model';


const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, { 
    // Soft Delete
     paranoid: true,
     
    // hooks: {
    //     beforeCreate: (user: any, options: any) => {
    //         user.password = bcrypt.hashSync(user.password, 10);
    //     }
    // }

});

// Relationships
// User has one wallet
User.hasOne(Wallet);


//export model
export default User;