import {
    Box,
    List,
    ListItem,
    Typography,
    useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom"; // For React Router
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

interface TabOption {
    label: string;
    value: string; // value will now be route path
}

interface LinkControllerProps {
    options?: TabOption[];
}

export default function LinkController({ options = [] }: LinkControllerProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation(); // Gives current path

    const settings = {
        dots: false,
        arrows: false,
        infinite: false,
        speed: 500,
        mobileFirst: true,
        slidesToShow: 3,
        slidesToScroll: 2,
        focusOnSelect: true,
        variableWidth: true,
        responsive: [
            { breakpoint: 768, settings: { slidesToShow: 4 } },
            { breakpoint: 992, settings: { slidesToShow: 5 } },
            { breakpoint: 1200, settings: { slidesToShow: 6, focusOnSelect: false } },
            { breakpoint: 1440, settings: { slidesToShow: 7 } },
        ],
    };

    return (
        <>
            {/* Mobile Slider */}
            <Box
                className="p-1! rounded-md"
                sx={{
                    background: theme.palette.tab.background,
                    display: { xs: "block", lg: "none" },
                }}
            >
                <Slider {...settings}>
                    {options.map((tab) => {
                        const isActive = location.pathname === tab.value;

                        return (
                            <div
                                key={tab.value}
                                onClick={() => navigate(tab.value)}
                                className={` rounded-sm ${isActive ? "active__tab__controller" : ""}`}
                            >
                                <div className={
                                    `px-6 py-2 cursor-pointer flex  items-center gap-1.5`
                                }>
                                    <Typography
                                        variant="subtitle2"
                                        color="text.middle"
                                        className="text-nowrap text-center"
                                    >
                                        {tab.label}
                                    </Typography>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            </Box>

            {/* Desktop Menu */}
            <List
                sx={{
                    background: theme.palette.tab.background,
                    display: { xs: "none", lg: "flex" },
                    overflow: "auto",
                }}
                className="p-1! rounded-md max-w-fit flex items-center"
            >
                {options.map((tab) => {
                    const isActive = location.pathname === tab.value;

                    return (
                        <ListItem
                            key={tab.value}
                            onClick={() => navigate(tab.value)}

                        >
                            <div className={
                                `px-6 py-2 rounded-sm cursor-pointer flex  items-center gap-1.5 ${isActive ? "active__tab__controller" : ""}`
                            }>
                                <Typography
                                    variant="subtitle2"
                                    color="text.middle"
                                    className=" text-nowrap"
                                >
                                    {tab.label}
                                </Typography>
                            </div>
                        </ListItem>
                    );
                })}
            </List>
        </>
    );
}