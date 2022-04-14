#define gpuRes() GPU.getResolution()

#define clearScreen() \
    local w, h = gpuRes() \
    GPU.fill(1, 1, w, h, " ")