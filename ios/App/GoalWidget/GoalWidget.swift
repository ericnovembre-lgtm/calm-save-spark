// iOS Goal Progress Widget for $ave+
// This file should be placed in your Xcode project after running `npx cap add ios`
// Requires WidgetKit and SwiftUI

import WidgetKit
import SwiftUI

// MARK: - Widget Data
struct GoalEntry: TimelineEntry {
    let date: Date
    let goalName: String
    let currentAmount: Double
    let targetAmount: Double
    let progress: Double
    let currency: String
}

// MARK: - Provider
struct GoalProvider: TimelineProvider {
    let appGroupId = "group.app.lovable.saveplus"
    
    func placeholder(in context: Context) -> GoalEntry {
        GoalEntry(
            date: Date(),
            goalName: "Savings Goal",
            currentAmount: 0,
            targetAmount: 1000,
            progress: 0,
            currency: "USD"
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (GoalEntry) -> Void) {
        let entry = loadGoalData()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<GoalEntry>) -> Void) {
        let entry = loadGoalData()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadGoalData() -> GoalEntry {
        guard let userDefaults = UserDefaults(suiteName: appGroupId) else {
            return placeholder(in: Context())
        }
        
        let goalName = userDefaults.string(forKey: "goalName") ?? "Savings Goal"
        let currentAmount = userDefaults.double(forKey: "goalCurrent")
        let targetAmount = userDefaults.double(forKey: "goalTarget")
        let progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
        let currency = userDefaults.string(forKey: "currency") ?? "USD"
        
        return GoalEntry(
            date: Date(),
            goalName: goalName,
            currentAmount: currentAmount,
            targetAmount: targetAmount,
            progress: min(progress, 100),
            currency: currency
        )
    }
}

// MARK: - Progress Ring View
struct ProgressRing: View {
    let progress: Double
    let lineWidth: CGFloat
    
    var body: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: lineWidth)
            
            // Progress ring
            Circle()
                .trim(from: 0, to: CGFloat(min(progress / 100, 1)))
                .stroke(
                    AngularGradient(
                        colors: [.green, .cyan, .green],
                        center: .center
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.5), value: progress)
        }
    }
}

// MARK: - Widget View
struct GoalWidgetView: View {
    var entry: GoalEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [Color("WidgetBackground"), Color("WidgetBackgroundSecondary")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            if family == .systemSmall {
                smallView
            } else {
                mediumView
            }
        }
    }
    
    var smallView: some View {
        VStack(spacing: 8) {
            // Progress ring with percentage
            ZStack {
                ProgressRing(progress: entry.progress, lineWidth: 8)
                    .frame(width: 60, height: 60)
                
                Text("\(Int(entry.progress))%")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
            }
            
            // Goal name
            Text(entry.goalName)
                .font(.caption)
                .fontWeight(.medium)
                .lineLimit(1)
                .foregroundColor(.primary)
            
            // Amount
            Text(formatCurrency(entry.currentAmount))
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding()
    }
    
    var mediumView: some View {
        HStack(spacing: 16) {
            // Progress ring
            ZStack {
                ProgressRing(progress: entry.progress, lineWidth: 10)
                    .frame(width: 80, height: 80)
                
                VStack(spacing: 0) {
                    Text("\(Int(entry.progress))%")
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                    Text("saved")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                // Goal name
                HStack {
                    Image(systemName: "target")
                        .foregroundColor(.green)
                    Text(entry.goalName)
                        .font(.headline)
                }
                
                // Amounts
                Text("\(formatCurrency(entry.currentAmount)) of \(formatCurrency(entry.targetAmount))")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                // Remaining
                let remaining = max(entry.targetAmount - entry.currentAmount, 0)
                Text("\(formatCurrency(remaining)) to go")
                    .font(.caption)
                    .foregroundColor(.green)
            }
            
            Spacer()
        }
        .padding()
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = entry.currency
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: amount)) ?? "$0"
    }
}

// MARK: - Widget Configuration
@main
struct GoalWidget: Widget {
    let kind: String = "GoalWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GoalProvider()) { entry in
            GoalWidgetView(entry: entry)
        }
        .configurationDisplayName("Goal Progress")
        .description("Track your savings goal progress")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview
struct GoalWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            GoalWidgetView(entry: GoalEntry(
                date: Date(),
                goalName: "Emergency Fund",
                currentAmount: 3500,
                targetAmount: 5000,
                progress: 70,
                currency: "USD"
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            
            GoalWidgetView(entry: GoalEntry(
                date: Date(),
                goalName: "Vacation Fund",
                currentAmount: 1200,
                targetAmount: 3000,
                progress: 40,
                currency: "USD"
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
