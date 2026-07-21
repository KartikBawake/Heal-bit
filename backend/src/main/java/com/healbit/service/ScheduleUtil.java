package com.healbit.service;

import com.healbit.entity.Doctor;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Shared helpers for fixed-length (30 minute) appointment slots and weekly schedules. */
public final class ScheduleUtil {

    public static final int SLOT_MINUTES = 30;

    private static final String[] TOKENS = { "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN" };

    private ScheduleUtil() {}

    public static String dayToken(DayOfWeek day) {
        return TOKENS[day.getValue() - 1]; // DayOfWeek: MONDAY=1 ... SUNDAY=7
    }

    /** Parse a stored CSV like "MON,TUE,WED" into an ordered set of DayOfWeek. */
    public static Set<DayOfWeek> parseWorkingDays(String csv) {
        Set<DayOfWeek> days = new LinkedHashSet<>();
        if (!StringUtils.hasText(csv)) return days;
        for (String raw : csv.split(",")) {
            String t = raw.trim().toUpperCase();
            for (int i = 0; i < TOKENS.length; i++) {
                if (TOKENS[i].equals(t)) days.add(DayOfWeek.of(i + 1));
            }
        }
        return days;
    }

    /** Normalise a list of day tokens from the client into a clean stored CSV. */
    public static String toWorkingDaysCsv(List<String> input) {
        if (input == null || input.isEmpty()) return "";
        List<String> ordered = new ArrayList<>();
        for (String token : TOKENS) {
            for (String raw : input) {
                if (raw != null && token.equalsIgnoreCase(raw.trim()) && !ordered.contains(token)) {
                    ordered.add(token);
                }
            }
        }
        return String.join(",", ordered);
    }

    public static List<String> workingDaysList(String csv) {
        List<String> out = new ArrayList<>();
        if (!StringUtils.hasText(csv)) return out;
        for (String raw : csv.split(",")) {
            String t = raw.trim().toUpperCase();
            if (Arrays.asList(TOKENS).contains(t)) out.add(t);
        }
        return out;
    }

    /** All 30-minute slot start times within [start, end). Last slot ends at or before end. */
    public static List<LocalTime> generateSlots(LocalTime start, LocalTime end) {
        List<LocalTime> slots = new ArrayList<>();
        if (start == null || end == null || !start.isBefore(end)) return slots;
        LocalTime t = start;
        while (!t.plusMinutes(SLOT_MINUTES).isAfter(end)) {
            slots.add(t);
            t = t.plusMinutes(SLOT_MINUTES);
        }
        return slots;
    }

    /** True if the doctor has a usable weekly schedule configured. */
    public static boolean scheduleConfigured(Doctor d) {
        return StringUtils.hasText(d.getWorkingDays())
                && d.getStartTime() != null
                && d.getEndTime() != null
                && d.getStartTime().isBefore(d.getEndTime());
    }
}
