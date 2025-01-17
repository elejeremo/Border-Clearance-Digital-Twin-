def get_health_colors(health_value: str) -> tuple[int, int]:
    """
    Convert health percentage to color values.
    Returns (color1, color2) tuple with hex color values.
    """
    try:
        # Remove the % sign and convert to float
        health = float(health_value.rstrip('%'))
        
        if health >= 80:
            # Green gradient
            return (0x00ff00, 0x008800)
        elif health >= 60:
            # Yellow gradient
            return (0xffff00, 0x888800)
        elif health >= 40:
            # Orange gradient
            return (0xff8800, 0x884400)
        else:
            # Red gradient
            return (0xff0000, 0x880000)
    except (ValueError, TypeError):
        # Default colors if health value is invalid
        return (0x888888, 0x444444)