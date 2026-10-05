import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SearchPanel } from "@/components/layout/SearchPanel";
import { AttendanceCalculator } from "@/tools/education/AttendanceCalculator";
import { CgpaCalculator } from "@/tools/education/CgpaCalculator";
import { PercentageCalculator } from "@/tools/education/PercentageCalculator";
import { SgpaCalculator } from "@/tools/education/SgpaCalculator";

describe("SearchPanel", () => {
  it("finds tools by keyword and links to them", async () => {
    const user = userEvent.setup();
    render(<SearchPanel />);
    await user.type(screen.getByLabelText("Search tools"), "cgpa");
    const link = await screen.findByRole("link", { name: /CGPA Calculator/i });
    expect(link.getAttribute("href")).toMatch(/^\/tools\/education\/cgpa-calculator\/?$/);
  });

  it("shows an empty state for no matches", async () => {
    const user = userEvent.setup();
    render(<SearchPanel />);
    await user.type(screen.getByLabelText("Search tools"), "zzzzqq");
    expect(await screen.findByText("No tools found")).toBeInTheDocument();
  });
});

describe("SgpaCalculator", () => {
  it("calculates SGPA and shows the breakdown", async () => {
    const user = userEvent.setup();
    render(<SgpaCalculator />);
    const rows = [
      ["4", "O"],
      ["3", "A+"],
      ["3", "B"],
      ["2", "A"],
    ];
    for (const [i, [credits, grade]] of rows.entries()) {
      await user.type(screen.getByLabelText(`Subject ${i + 1} credits`), credits);
      await user.selectOptions(screen.getByLabelText(`Subject ${i + 1} grade`), grade);
    }
    await user.click(screen.getByRole("button", { name: "Calculate SGPA" }));
    const result = screen.getByRole("region", { name: "Your SGPA" });
    expect(within(result).getByText("8.42")).toBeInTheDocument();
    expect(within(result).getByRole("button", { name: /copy result/i })).toBeEnabled();
  });

  it("shows validation errors for incomplete rows", async () => {
    const user = userEvent.setup();
    render(<SgpaCalculator />);
    await user.type(screen.getByLabelText("Subject 1 credits"), "3");
    await user.click(screen.getByRole("button", { name: "Calculate SGPA" }));
    expect(screen.getByText("Choose a grade.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Your SGPA" })).not.toBeInTheDocument();
  });

  it("adds, removes and resets rows", async () => {
    const user = userEvent.setup();
    render(<SgpaCalculator />);
    await user.click(screen.getByRole("button", { name: /add subject/i }));
    expect(screen.getByLabelText("Subject 5 credits")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove subject 5" }));
    expect(screen.queryByLabelText("Subject 5 credits")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Subject 1 credits"), "9");
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByLabelText("Subject 1 credits")).toHaveValue("");
  });
});

describe("CgpaCalculator", () => {
  it("switches to the semester method and calculates", async () => {
    const user = userEvent.setup();
    render(<CgpaCalculator />);
    await user.click(screen.getByRole("tab", { name: "From semester SGPAs" }));
    await user.type(screen.getByLabelText("Semester 1 SGPA"), "8.2");
    await user.type(screen.getByLabelText("Semester 1 credits"), "22");
    await user.type(screen.getByLabelText("Semester 2 SGPA"), "8.8");
    await user.type(screen.getByLabelText("Semester 2 credits"), "24");
    await user.click(screen.getByRole("button", { name: "Calculate CGPA" }));
    expect(screen.getByText("8.51")).toBeInTheDocument();
  });
});

describe("PercentageCalculator", () => {
  it("calculates marks percentage", async () => {
    const user = userEvent.setup();
    render(<PercentageCalculator />);
    await user.click(screen.getByRole("tab", { name: "Marks %" }));
    await user.type(screen.getByLabelText("Marks obtained"), "432");
    await user.type(screen.getByLabelText("Total marks"), "500");
    const panel = screen.getByRole("tabpanel");
    await user.click(within(panel).getByRole("button", { name: "Calculate" }));
    expect(screen.getAllByText("86.4%").length).toBeGreaterThan(0);
  });

  it("explains invalid input", async () => {
    const user = userEvent.setup();
    render(<PercentageCalculator />);
    await user.click(
      within(screen.getByRole("tabpanel")).getByRole("button", { name: "Calculate" }),
    );
    expect(screen.getAllByText("Please enter a valid number.").length).toBe(2);
  });
});

describe("AttendanceCalculator", () => {
  it("reports classes that can be missed", async () => {
    const user = userEvent.setup();
    render(<AttendanceCalculator />);
    await user.type(screen.getByLabelText("Total classes held so far"), "50");
    await user.type(screen.getByLabelText("Classes attended"), "42");
    await user.click(screen.getByRole("button", { name: "Calculate attendance" }));
    expect(screen.getByText("84%")).toBeInTheDocument();
    expect(screen.getByText("Classes you can still miss")).toBeInTheDocument();
    expect(screen.getAllByText(/6 more classes/).length).toBeGreaterThan(0);
  });

  it("flags attended greater than total", async () => {
    const user = userEvent.setup();
    render(<AttendanceCalculator />);
    await user.type(screen.getByLabelText("Total classes held so far"), "10");
    await user.type(screen.getByLabelText("Classes attended"), "11");
    await user.click(screen.getByRole("button", { name: "Calculate attendance" }));
    expect(screen.getByText(/cannot be more than total/i)).toBeInTheDocument();
  });
});
