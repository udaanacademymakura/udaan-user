import { Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { useThemeSettings } from '../../../../hooks/useThemeSettings';
import { PATH } from '../../../../routes/PATH';
import { useBookmakrCourseMutation } from '../../../../services/courseApi';
import { showToast } from '../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../store/hook';
import type { CourseProps } from '../../../../types/course';
import CourseCardButton from './CourseCardButton';
import CourseFeature from './CourseFeature';
import CourseStatus from './CourseStatus';

export default function CourseCard({ course, havePurchased = false }: { course: CourseProps, havePurchased?: boolean }) {
    const dispatch = useAppDispatch()
    const theme = useTheme();
    const { fallbackImageUrl } = useThemeSettings();
    const [bookmark] = useBookmakrCourseMutation();
    const handleBookmark = async () => {
        try {
            const response = await bookmark({ id: Number(course.id) }).unwrap();
            dispatch(
                showToast({
                    message: response?.message || "Unable to add bookmark.",
                    severity: "success",
                })
            )
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to add bookmark.",
                    severity: "error",
                })
            )
        }
    }
    return (
        <Box className="course__card rounded-md overflow-hidden relative h-full flex flex-col" sx={{
            border: `1px solid ${theme.palette.textField.border}`
        }}>
            <Box className="course__image " sx={{
                background: theme.palette.primary.contrastText
            }}>
                <img src={course.thumbnail_url || fallbackImageUrl} alt={course.name} className='w-full h-full object-cover aspect-2/1' />
            </Box>
            <Box className="course__content h-full p-3  flex flex-col gap-2 justify-between" sx={{
                background: theme.palette.gray.gray1
            }}>
                <div className="top__content">
                    <div className="over__title flex justify-between items-center">
                        {course?.mega_categories?.length ? <Typography variant='subtitle2' className='py-0.5 px-2 rounded-md' sx={{
                            background: theme.palette.primary.light,
                            color: theme.palette.primary.main
                        }}>{course?.mega_categories && course?.mega_categories[0]}</Typography> : <div />}
                        <IconButton size='small' sx={{ p: 0 }} onClick={handleBookmark}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill={course?.is_bookmarked ? theme.palette.primary.main : "none"} xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 21L12 17L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke={course?.is_bookmarked ? theme.palette.primary.main : "#111111"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </IconButton>
                    </div>
                    <Link to={PATH.COURSE_MANAGEMENT.COURSES.VIEW_COURSE.ROOT(course.id)} className='no-underline text-transparent! leading-1.5 mt-2.5 mb-3.5 block '>
                        <Typography variant='subtitle1' fontWeight={500} color='text.dark' className='no-underline'>{course.name}</Typography>
                    </Link>
                    <CourseFeature subject={course?.subjects}
                        startFrom={course?.course_expiry?.start_date}
                        endAt={course?.course_expiry?.end_date}
                    />
                </div>
                <div className="footer__content mt-3">
                    <Divider className='mb-2!' />
                    <CourseCardButton courseType={course?.course_type}
                        sellingPrice={course?.sale_price}
                        markedPrice={course?.marked_price}
                        to={PATH.COURSE_MANAGEMENT.COURSES.VIEW_COURSE.ROOT(course.id)}
                        havePurchased={havePurchased || course?.user?.has_purchased}
                        freeTrialCount={course?.user?.free_trial_count}
                    />
                </div>
            </Box>
            <div className="absolute! top-1.5 left-1.5">
                <CourseStatus status={course.course_type} />
            </div>
        </Box>
    )
}
