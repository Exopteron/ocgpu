local Texture2D = {
    new = function(self, width, height, rgbdata)
        local t = setmetatable({}, {__index = self})
        t.width = width
        t.height = height
        t.data = rgbdata
        return t
    end,
    pixelAt = function(self, x, y)
        local no_channels = 3
        local min_index = ((y * self.width + x) * no_channels) + 1

        return self.data[min_index], self.data[min_index + 1], self.data[min_index + 2]
    end,
    sample = function(self, x, y)
        local x = math.floor(denormalize(x, 0, self.width))
        local y = math.floor(denormalize(y, 0, self.height))
        return self:pixelAt(x, y)
    end
}