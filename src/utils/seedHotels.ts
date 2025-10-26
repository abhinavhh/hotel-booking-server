// utils/seedHotels.ts
import Hotel from '../models/hotel.model';
import mongoose from 'mongoose';

export const seedHotels = async () => {
  try {
    // Check if hotels already exist
    const count = await Hotel.countDocuments();
    if (count > 0) {
      console.log('Hotels already seeded');
      return;
    }

    const sampleHotels = [
      {
        name: 'Grand Plaza Hotel',
        description: 'Luxury hotel in the heart of the city with stunning skyline views. Experience world-class hospitality and premium amenities.',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
        ],
        location: {
          city: 'New York',
          state: 'NY',
          country: 'USA',
          address: '123 Broadway Street',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        rating: 4.5,
        reviewCount: 230,
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking', 'Air Conditioning'],
        rooms: [
          {
            type: 'Deluxe Suite',
            description: 'Spacious suite with city view',
            price: 200,
            maxGuests: 2,
            bedType: 'King',
            available: true,
            amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'TV']
          },
          {
            type: 'Executive Room',
            description: 'Modern room with work desk',
            price: 150,
            maxGuests: 2,
            bedType: 'Queen',
            available: true,
            amenities: ['WiFi', 'Air Conditioning', 'Work Desk']
          }
        ],
        pricePerNight: 150,
        featured: true,
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        ownerId: new mongoose.Types.ObjectId()
      },
      {
        name: 'Sunset Beach Resort',
        description: 'Beachfront paradise with private beach access. Perfect for a relaxing getaway with family and friends.',
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        location: {
          city: 'Miami',
          state: 'FL',
          country: 'USA',
          address: '456 Ocean Drive',
          coordinates: { lat: 25.7617, lng: -80.1918 }
        },
        rating: 4.8,
        reviewCount: 350,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Spa', 'Bar'],
        rooms: [
          {
            type: 'Ocean View Suite',
            description: 'Breathtaking ocean views',
            price: 300,
            maxGuests: 3,
            bedType: 'King',
            available: true,
            amenities: ['WiFi', 'Balcony', 'Mini Bar', 'Ocean View']
          }
        ],
        pricePerNight: 250,
        featured: true,
        cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
        ownerId: new mongoose.Types.ObjectId()
      },
      {
        name: 'Mountain View Lodge',
        description: 'Cozy mountain retreat with spectacular views. Ideal for nature lovers and adventure seekers.',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'
        ],
        location: {
          city: 'Denver',
          state: 'CO',
          country: 'USA',
          address: '789 Mountain Road',
          coordinates: { lat: 39.7392, lng: -104.9903 }
        },
        rating: 4.6,
        reviewCount: 180,
        amenities: ['WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant', 'Parking'],
        rooms: [
          {
            type: 'Mountain Cabin',
            description: 'Rustic cabin with fireplace',
            price: 180,
            maxGuests: 4,
            bedType: '2 Queens',
            available: true,
            amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Mountain View']
          }
        ],
        pricePerNight: 180,
        featured: false,
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        ownerId: new mongoose.Types.ObjectId()
      },
      {
        name: 'Downtown Business Hotel',
        description: 'Modern hotel perfect for business travelers. Located in the financial district with easy access to major offices.',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
        ],
        location: {
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          address: '321 Michigan Avenue',
          coordinates: { lat: 41.8781, lng: -87.6298 }
        },
        rating: 4.3,
        reviewCount: 120,
        amenities: ['WiFi', 'Gym', 'Business Center', 'Restaurant', 'Parking'],
        rooms: [
          {
            type: 'Business Suite',
            description: 'Suite with office space',
            price: 175,
            maxGuests: 2,
            bedType: 'King',
            available: true,
            amenities: ['WiFi', 'Work Desk', 'Conference Call Setup']
          }
        ],
        pricePerNight: 175,
        featured: false,
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        ownerId: new mongoose.Types.ObjectId()
      },
      {
        name: 'Historic Heritage Inn',
        description: 'Charming historic hotel with modern amenities. Experience the perfect blend of old-world elegance and contemporary comfort.',
        images: [
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
        ],
        location: {
          city: 'Boston',
          state: 'MA',
          country: 'USA',
          address: '567 Historic Lane',
          coordinates: { lat: 42.3601, lng: -71.0589 }
        },
        rating: 4.7,
        reviewCount: 210,
        amenities: ['WiFi', 'Free Breakfast', 'Restaurant', 'Parking', 'Garden'],
        rooms: [
          {
            type: 'Heritage Room',
            description: 'Classic room with vintage decor',
            price: 160,
            maxGuests: 2,
            bedType: 'Queen',
            available: true,
            amenities: ['WiFi', 'Antique Furniture', 'TV']
          }
        ],
        pricePerNight: 160,
        featured: false,
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
        ownerId: new mongoose.Types.ObjectId()
      },
      {
        name: 'Luxury Skyline Suites',
        description: 'Ultra-luxury high-rise hotel with panoramic city views. Indulge in opulence and sophistication.',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
        ],
        location: {
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          address: '890 Sunset Boulevard',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        rating: 4.9,
        reviewCount: 450,
        amenities: ['WiFi', 'Pool', 'Spa', 'Fine Dining', 'Valet Parking', 'Concierge'],
        rooms: [
          {
            type: 'Penthouse Suite',
            description: 'Luxurious penthouse with terrace',
            price: 500,
            maxGuests: 4,
            bedType: 'King + Sofa Bed',
            available: true,
            amenities: ['WiFi', 'Private Terrace', 'Butler Service', 'Premium Bar']
          }
        ],
        pricePerNight: 400,
        featured: true,
        cancellationPolicy: 'Free cancellation up to 72 hours before check-in',
        ownerId: new mongoose.Types.ObjectId()
      }
    ];

    await Hotel.insertMany(sampleHotels);
    console.log('✅ Sample hotels seeded successfully');
  } catch (error) {
    console.error('Error seeding hotels:', error);
  }
};