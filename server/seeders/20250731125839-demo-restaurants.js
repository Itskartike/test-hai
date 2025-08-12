"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add sample restaurants
    await queryInterface.bulkInsert(
      "Restaurants",
      [
        {
          name: "Pizza Palace",
          address: "123 Main St, Downtown",
          lat: 40.7128,
          lng: -74.006,
          image:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Burger House",
          address: "456 Oak Ave, Midtown",
          lat: 40.7589,
          lng: -73.9851,
          image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sushi Express",
          address: "789 Pine St, Uptown",
          lat: 40.7505,
          lng: -73.9934,
          image:
            "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Taco Fiesta",
          address: "321 Elm St, Westside",
          lat: 40.7614,
          lng: -73.9776,
          image:
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Add sample menu items for each restaurant
    await queryInterface.bulkInsert(
      "MenuItems",
      [
        // Pizza Palace items
        {
          restaurant_id: 1,
          name: "Margherita Pizza",
          price: 12.99,
          image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300",
          description: "Classic tomato sauce with mozzarella cheese",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 1,
          name: "Pepperoni Pizza",
          price: 14.99,
          image:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300",
          description: "Spicy pepperoni with melted cheese",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 1,
          name: "BBQ Chicken Pizza",
          price: 16.99,
          image:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300",
          description: "BBQ sauce with grilled chicken and onions",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Burger House items
        {
          restaurant_id: 2,
          name: "Classic Cheeseburger",
          price: 8.99,
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
          description: "Beef patty with cheese, lettuce, and tomato",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 2,
          name: "Bacon Deluxe Burger",
          price: 11.99,
          image:
            "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300",
          description: "Beef patty with bacon, cheese, and special sauce",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 2,
          name: "Veggie Burger",
          price: 9.99,
          image:
            "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300",
          description: "Plant-based patty with fresh vegetables",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Sushi Express items
        {
          restaurant_id: 3,
          name: "California Roll",
          price: 6.99,
          image:
            "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300",
          description: "Crab, avocado, and cucumber roll",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 3,
          name: "Salmon Nigiri",
          price: 4.99,
          image:
            "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300",
          description: "Fresh salmon over seasoned rice",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 3,
          name: "Dragon Roll",
          price: 12.99,
          image:
            "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300",
          description: "Eel, avocado, and cucumber with eel sauce",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Taco Fiesta items
        {
          restaurant_id: 4,
          name: "Beef Tacos",
          price: 7.99,
          image:
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300",
          description: "Three beef tacos with lettuce, cheese, and salsa",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 4,
          name: "Chicken Quesadilla",
          price: 8.99,
          image:
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300",
          description: "Grilled chicken with cheese in a flour tortilla",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          restaurant_id: 4,
          name: "Guacamole & Chips",
          price: 4.99,
          image:
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300",
          description: "Fresh guacamole with crispy tortilla chips",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove all seeded data
    await queryInterface.bulkDelete("MenuItems", null, {});
    await queryInterface.bulkDelete("Restaurants", null, {});
  },
};
