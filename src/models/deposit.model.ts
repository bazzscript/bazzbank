import Sequelize from 'sequelize';
import sequelize from '../configs/database.config';

const Deposit = sequelize.define('deposit', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    fees: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: true
    },
    type: {
        type: Sequelize.ENUM('card_deposit', 'bank_deposit'),
        allowNull: false
    },
    destination_account: {
        type: Sequelize.STRING,
        allowNull: false
    },
    source_card_number: {
        type: Sequelize.STRING,
        allowNull: true
    },
    source_card_holder_name: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {});


// Relationships

//Export Model
export default Deposit;