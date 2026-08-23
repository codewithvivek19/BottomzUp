export type RestaurantEvent = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  imageUrl: string | null;
  published: boolean;
};
