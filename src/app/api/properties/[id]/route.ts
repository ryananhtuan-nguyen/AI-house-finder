import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// The same mock data as in the main properties API
// In a real app, this would be in a shared database or imported from a common file
const PROPERTIES = [
  {
    id: 'prop1',
    title: 'Sunny 2 Bedroom in Wellington CBD',
    location: 'Wellington',
    price: 550,
    bedrooms: 2,
    bathrooms: 1,
    description:
      'Modern apartment with great natural light and renovated kitchen. Close to public transport and shops.\n\nThis well-maintained apartment features an open plan living area that gets wonderful afternoon sun. The kitchen has been recently updated with modern appliances including a dishwasher. Both bedrooms are a good size with built-in wardrobes.\n\nThe location is perfect for city workers or students, with public transport right outside and major shopping areas within walking distance.',
    imageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    matchScore: 95,
    available: 'Now',
    amenities: ['Dishwasher', 'Heat Pump', 'Parking'],
    address: '123 Lambton Quay, Wellington',
    contactName: 'Jane Smith',
    contactPhone: '04-123-4567',
  },
  {
    id: 'prop2',
    title: 'Spacious Family Home in Lower Hutt',
    location: 'Lower Hutt',
    price: 650,
    bedrooms: 3,
    bathrooms: 2,
    description:
      'Quiet neighborhood, close to schools. Large backyard and modern appliances. Recently renovated bathroom.\n\nThis lovely family home features three spacious bedrooms and a newly renovated main bathroom. The kitchen has modern appliances and plenty of storage space. The open-plan living area flows seamlessly to a large, sunny deck perfect for family barbecues.\n\nSet in a quiet, family-friendly street, this home is close to excellent schools, parks, and public transport.',
    imageUrl:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 88,
    available: '2023-06-01',
    amenities: ['Garden', 'Garage', 'Heat Pump', 'Pets Allowed'],
    address: '45 High Street, Lower Hutt',
    contactName: 'Michael Brown',
    contactPhone: '04-987-6543',
  },
  {
    id: 'prop3',
    title: 'Modern Studio in Auckland',
    location: 'Auckland',
    price: 420,
    bedrooms: 1,
    bathrooms: 1,
    description:
      "Compact but well-designed studio apartment. Great location with cafes and bus stops nearby.\n\nThis studio apartment maximizes space with a clever layout and built-in storage solutions. The modern kitchenette includes essential appliances, and the bathroom is clean and functional.\n\nLocated in a vibrant part of Auckland, you'll find cafes, restaurants, and shops just steps from your door. Public transport options are plentiful, making it easy to get around the city.",
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHN0dWRpbyUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 82,
    available: 'Now',
    amenities: ['Furnished', 'Internet Included', 'Laundry Facilities'],
    address: '78 Queen Street, Auckland',
    contactName: 'Sarah Johnson',
    contactPhone: '09-555-1234',
  },
  {
    id: 'prop4',
    title: 'Charming Cottage in Christchurch',
    location: 'Christchurch',
    price: 480,
    bedrooms: 2,
    bathrooms: 1,
    description:
      'Beautifully renovated cottage with garden. Quiet street with friendly neighbors. Modern kitchen and cozy living room.\n\nThis charming cottage has been lovingly restored to maintain its character features while incorporating modern comforts. The living room has a cozy fireplace perfect for winter evenings, and the kitchen has been fully updated with quality appliances.\n\nThe private garden is easy to maintain and provides a lovely outdoor space for relaxing or entertaining.',
    imageUrl:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y290dGFnZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 91,
    available: '2023-06-15',
    amenities: ['Garden', 'Fireplace', 'Storage Shed'],
    address: '15 Riverside Lane, Christchurch',
    contactName: 'David Wilson',
    contactPhone: '03-333-7890',
  },
  {
    id: 'prop5',
    title: 'Waterfront Apartment in Tauranga',
    location: 'Tauranga',
    price: 595,
    bedrooms: 2,
    bathrooms: 2,
    description:
      "Modern apartment with stunning ocean views. Walking distance to cafes and shops. Includes parking and storage.\n\nWake up to breathtaking ocean views from this contemporary apartment. The open-plan living area features floor-to-ceiling windows to maximize the view, and there's a generous balcony for outdoor relaxation.\n\nBoth bedrooms are a good size, and the master bedroom has an ensuite bathroom. The apartment comes with a secure parking space and a storage unit.",
    imageUrl:
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50JTIwdmlld3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    matchScore: 89,
    available: 'Now',
    amenities: ['Balcony', 'Sea View', 'Secure Parking', 'Gym'],
    address: '230 Marine Parade, Tauranga',
    contactName: 'Emma Taylor',
    contactPhone: '07-777-4321',
  },
]

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id

  // Find the property with matching ID
  const property = PROPERTIES.find((prop) => prop.id === id)

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({ property })
}
