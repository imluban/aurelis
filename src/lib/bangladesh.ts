export type BangladeshDivision = {
  name: string;
  districts: string[];
};

export const bangladeshDivisions: BangladeshDivision[] = [
  {
    name: "Barishal",
    districts: [
      "Barguna",
      "Barishal",
      "Bhola",
      "Jhalokati",
      "Patuakhali",
      "Pirojpur",
    ],
  },
  {
    name: "Chattogram",
    districts: [
      "Bandarban",
      "Brahmanbaria",
      "Chandpur",
      "Chattogram",
      "Cumilla",
      "Cox's Bazar",
      "Feni",
      "Khagrachhari",
      "Lakshmipur",
      "Noakhali",
      "Rangamati",
    ],
  },
  {
    name: "Dhaka",
    districts: [
      "Dhaka",
      "Faridpur",
      "Gazipur",
      "Gopalganj",
      "Kishoreganj",
      "Madaripur",
      "Manikganj",
      "Munshiganj",
      "Narayanganj",
      "Narsingdi",
      "Rajbari",
      "Shariatpur",
      "Tangail",
    ],
  },
  {
    name: "Khulna",
    districts: [
      "Bagerhat",
      "Chuadanga",
      "Jashore",
      "Jhenaidah",
      "Khulna",
      "Kushtia",
      "Magura",
      "Meherpur",
      "Narail",
      "Satkhira",
    ],
  },
  {
    name: "Mymensingh",
    districts: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  },
  {
    name: "Rajshahi",
    districts: [
      "Bogura",
      "Joypurhat",
      "Naogaon",
      "Natore",
      "Chapainawabganj",
      "Pabna",
      "Rajshahi",
      "Sirajganj",
    ],
  },
  {
    name: "Rangpur",
    districts: [
      "Dinajpur",
      "Gaibandha",
      "Kurigram",
      "Lalmonirhat",
      "Nilphamari",
      "Panchagarh",
      "Rangpur",
      "Thakurgaon",
    ],
  },
  {
    name: "Sylhet",
    districts: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  },
];

export const bangladeshDistricts = bangladeshDivisions
  .flatMap((division) =>
    division.districts.map((district) => ({
      name: district,
      division: division.name,
    })),
  )
  .sort((a, b) => a.name.localeCompare(b.name));
