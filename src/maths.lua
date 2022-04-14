#define newVec2(x, y) {x, y}

#define newVec2SS(x, y) \ 
{x + (w / 2), ((y * 0.5) + (h / 2))}

#define crossProduct(v1, v2) math.floor(v1[1] * v2[2] - v1[2] * v2[1])


#define denormalize(x, a, b) x * (b - a) + a

#define normalize(x, a, b) (x - a) / (b - a)

#define toNDC(x, min, max) ((x / 2 + 0.5) * (max - min) + min)

#define toRGB(red, green, blue) (math.floor(blue) + (256 * math.floor(green)) + (256 * 256 * math.floor(red)))
