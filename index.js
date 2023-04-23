const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Initialize the list of rooms
let rooms = [];

// Initialize the list of bookings
let bookings = [];

// Configure body-parser middleware to parse JSON in request bodies
app.use(bodyParser.json());

// Create a new room
app.post('/rooms', (req, res) => {
  const { name, seats, amenities, pricePerHour } = req.body;
  
  // Check if the room already exists
  if (rooms.find(room => room.name === name)) {
    res.status(400).json({ error: 'Room already exists' });
    return;
  }

  // Create the new room object and add it to the list of rooms
  const room = { name, seats, amenities, pricePerHour };
  rooms.push(room);

  // Send the new room object as a response
  res.status(201).json(room);
});

// Book a room
app.post('/bookings', (req, res) => {
  const { customerId, roomId, date, startTime, endTime } = req.body;

  // Check if the room exists
  const room = rooms.find(room => room.name === roomId);
  if (!room) {
    res.status(400).json({ error: 'Invalid room ID' });
    return;
  }

  // Check if the room is available for the specified time
  const conflictingBooking = bookings.find(booking => {
    return booking.roomId === roomId &&
           booking.date === date &&
           ((startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime) ||
            (startTime <= booking.startTime && endTime >= booking.endTime));
  });
  if (conflictingBooking) {
    res.status(400).json({ error: 'Room already booked for the specified time' });
    return;
  }

  // Create the new booking object and add it to the list of bookings
  const bookingId = bookings.length + 1;
  const bookingDate = new Date();
  const booking = { id: bookingId, customerId, roomId, date, startTime, endTime, status: 'Booked', bookingDate };
  bookings.push(booking);

  // Send the new booking object as a response
  res.status(201).json(booking);
});

// List how many times a customer has booked a room
app.get('/customers/:customerId/bookings', (req, res) => {
  const customerId = req.params.customerId;

  // Find all bookings for the customer
  const customerBookings = bookings.filter(booking => booking.customerId === customerId);

  // Map each booking to an object with the required details
  const bookingDetails = customerBookings.map(booking => {
    const room = rooms.find(room => room.name === booking.roomId);
    return {
      customerName: customerId,
      roomName: room.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking.id,
      bookingDate: booking.bookingDate,
      bookingStatus: booking.status
    };
  });

  // Send the booking details as a response
  res.json(bookingDetails);
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
