import {
    Box,
    List,
    ListItem,
    Typography,
    useTheme
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

interface TabOption<T> {
    label: string;
    value: T;
    count?: string | null;
}

interface TabControllerProps<T> {
    options?: TabOption<T>[];
    setActiveTab: (value: T) => void;
    currentActive: T;
    size?: "sm" | "md";

}

export default function TabController<T extends string | number>({
    setActiveTab,
    currentActive,
    options = [],
    size = "md"
}: TabControllerProps<T>) {
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
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 5,
                }
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 6,
                    focusOnSelect: false,
                }
            },
            {
                breakpoint: 1440,
                settings: {
                    slidesToShow: 7,
                }
            }
        ]
    };


    const theme = useTheme();

    return (
        <>
            <Box className="p-1! rounded-md w-full"
                sx={{
                    background: theme.palette.tab.background,
                    display: { xs: "block", lg: "none" }
                }}>
                <Slider {...settings}>
                    {options.map((tab) => (
                        <div key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                        >
                            <div className={
                                `${size === "sm" ? "px-2.5 py-1" : "px-6 py-2 "} rounded-md cursor-pointer flex  items-center gap-1.5 ${currentActive === tab.value ? "active__tab__controller" : ""}`
                            }>
                                <Typography
                                    variant="subtitle2"
                                    color="text.middle"
                                    className=" text-nowrap"
                                >
                                    {tab.label}
                                </Typography>
                                {tab.count ? <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.dark"
                                    className="w-4.5 h-4.5 rounded-full flex justify-center items-center"
                                    sx={{
                                        background: (theme) => theme.palette.primary.contrastText
                                    }}
                                >
                                    {tab.count}
                                </Typography> : ""}
                            </div>
                        </div>
                    ))}
                </Slider>
            </Box>
            {/* Desktop */}
            <List
                sx={{
                    background: theme.palette.tab.background,
                    display: { xs: "none", lg: "flex" },
                    overflow: "auto"
                }}
                className="p-1! rounded-md max-w-fit flex items-center"
            >
                {options.map((tab) => (
                    <ListItem
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}

                    >
                        <div className={
                            `${size === "sm" ? "px-2.5 py-1" : "px-6 py-2 "} rounded-md cursor-pointer flex  items-center gap-1.5 ${currentActive === tab.value ? "active__tab__controller" : ""}`
                        }>
                            <Typography
                                variant="subtitle2"
                                color="text.middle"
                                className=" text-nowrap"
                            >
                                {tab.label}
                            </Typography>
                            {tab.count ? <Typography
                                component="span"
                                variant="caption"
                                color="text.dark"
                                className="w-4.5 h-4.5 rounded-full flex justify-center items-center"
                                sx={{
                                    background: (theme) => theme.palette.primary.contrastText
                                }}
                            >
                                {tab.count}
                            </Typography> : ""}
                        </div>

                    </ListItem>
                ))}
            </List>
        </>
    );
}
