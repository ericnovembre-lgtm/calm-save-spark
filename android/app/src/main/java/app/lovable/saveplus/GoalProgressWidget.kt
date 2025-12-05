// Android Goal Progress Widget for $ave+
// This file should be placed in your Android project after running `npx cap add android`
// Requires Glance library for Jetpack Compose widgets

package app.lovable.saveplus

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.*
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import java.text.NumberFormat
import java.util.*

// Widget Data
data class GoalData(
    val goalName: String = "Savings Goal",
    val currentAmount: Double = 0.0,
    val targetAmount: Double = 1000.0,
    val progress: Float = 0f,
    val currency: String = "USD"
)

// Glance Widget
class GoalProgressWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Exact

    @Composable
    override fun Content() {
        val context = LocalContext.current
        val prefs = context.getSharedPreferences("SavePlusWidget", Context.MODE_PRIVATE)
        
        val data = GoalData(
            goalName = prefs.getString("goalName", "Savings Goal") ?: "Savings Goal",
            currentAmount = prefs.getFloat("goalCurrent", 0f).toDouble(),
            targetAmount = prefs.getFloat("goalTarget", 1000f).toDouble(),
            progress = prefs.getFloat("goalProgress", 0f),
            currency = prefs.getString("currency", "USD") ?: "USD"
        )

        GoalWidgetContent(data)
    }
}

@Composable
fun GoalWidgetContent(data: GoalData) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(Color(0xFF1a1a2e))
            .cornerRadius(16.dp)
            .clickable(actionStartActivity<MainActivity>())
            .padding(16.dp)
    ) {
        Column(
            modifier = GlanceModifier.fillMaxSize(),
            verticalAlignment = Alignment.Top,
            horizontalAlignment = Alignment.Start
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "🎯",
                    style = TextStyle(fontSize: 16.sp)
                )
                Spacer(modifier = GlanceModifier.width(8.dp))
                Text(
                    text = data.goalName,
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize: 14.sp,
                        fontWeight = FontWeight.Medium
                    ),
                    maxLines = 1
                )
            }

            Spacer(modifier = GlanceModifier.height(16.dp))

            // Progress percentage
            Row(
                verticalAlignment = Alignment.Bottom
            ) {
                Text(
                    text = "${data.progress.toInt()}",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF10b981)),
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Text(
                    text = "%",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF10b981)),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium
                    )
                )
            }

            Spacer(modifier = GlanceModifier.height(8.dp))

            // Progress bar
            Box(
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .background(Color(0xFF374151))
                    .cornerRadius(4.dp)
            ) {
                Box(
                    modifier = GlanceModifier
                        .fillMaxWidth(data.progress / 100f)
                        .height(8.dp)
                        .background(Color(0xFF10b981))
                        .cornerRadius(4.dp)
                )
            }

            Spacer(modifier = GlanceModifier.height(12.dp))

            // Amounts
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                horizontalAlignment = Alignment.SpaceBetween
            ) {
                Text(
                    text = formatCurrency(data.currentAmount, data.currency),
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF9ca3af)),
                        fontSize = 12.sp
                    )
                )
                Text(
                    text = formatCurrency(data.targetAmount, data.currency),
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF9ca3af)),
                        fontSize = 12.sp
                    )
                )
            }

            Spacer(modifier = GlanceModifier.defaultWeight())

            // Remaining
            val remaining = maxOf(data.targetAmount - data.currentAmount, 0.0)
            Text(
                text = "${formatCurrency(remaining, data.currency)} to go",
                style = TextStyle(
                    color = ColorProvider(Color(0xFF10b981)),
                    fontSize = 11.sp
                )
            )
        }
    }
}

private fun formatCurrency(amount: Double, currency: String): String {
    val format = NumberFormat.getCurrencyInstance(Locale.US)
    format.currency = Currency.getInstance(currency)
    format.maximumFractionDigits = 0
    return format.format(amount)
}

// Widget Receiver
class GoalProgressWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = GoalProgressWidget()
}
